import logging
import os
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import APIRouter, Body, Query
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from jwt import ExpiredSignatureError, InvalidSignatureError, PyJWTError, decode
from app.api.dependencies.auth_dep import get_current_user
from app.api.dependencies.user_dep import get_user_service
from app.api.schemas.food4u.user import UserLoginSchema, UserModel, UserResponse
from app.api.services.user_service import UserService
from app.api.services.food4u.profile_service import ProfileService
from app.api.models.food4u.user import Profile
from app.api.schemas.food4u.welcome import WelcomeFormData
from app.api.dependencies.food4u_dep import get_goals_service, get_medical_service, get_preference_service, get_profile_service
from app.api.schemas.food4u.medical import DietTypeCreate, DietTypeResponse, ICDCodesCreate
from app.api.services.food4u.goal_service import GoalService
from app.api.services.food4u.medical_service import MedicalService
from app.api.services.food4u.preferences_service import PreferenceService
from app.api.schemas.food4u.profile import ProfileSchema
from app.api.utils.utils import RateLimitUtil


router = APIRouter()

load_dotenv()

USER_JWT_SECRET_KEY = os.getenv('USER_JWT_SECRET_KEY')
USER_JWT_ALGORITHM = os.getenv('USER_JWT_ALGORITHM')


@router.get("/profile", response_model=UserModel)
async def create_profile(
    request: Request,
    service: UserService = Depends(get_user_service)
):
    token = request.headers.get("Authorization")

    print(token, "token")

    if token is None:
        raise HTTPException(status_code=403, detail="Token is missing")

    try:
        # Extract the token value
        token = token.split(" ")[1]  # Assumes "Bearer <token>"
        # Decode the JWT token
        payload = decode(token, USER_JWT_SECRET_KEY,
                         algorithms=[USER_JWT_ALGORITHM])
        user_id: str = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Call the service to create or retrieve the user profile
        profile = await service.create_profile(userId=user_id)

        print(profile, "profile")

        if profile:
            return profile  # FastAPI will serialize this using the response_model
        else:
            raise HTTPException(
                status_code=400, detail="Profile creation failed")

    except InvalidSignatureError:
        raise HTTPException(status_code=401, detail="Could not validate token")


@router.post("/login", response_model=UserResponse)
async def login_user(response: Response, user_data: UserLoginSchema, service: UserService = Depends(get_user_service)):
    user = await service.login_user(user_data.username, user_data.password)
    if user is None:
        raise HTTPException(
            status_code=401, detail="Invalid username or password")

    # Create and save tokens
    tokens = await service.create_and_save_tokens(user.id)

    # Set refresh token in HttpOnly cookie
    response.set_cookie(key="myRefresh_token",
                        value=tokens["refresh_token"], httponly=True, max_age=7 * 24 * 60 * 60)

    return ({"user": user, "tokens": tokens})


@router.get("/refresh")
async def refresh_token(request: Request, response: Response, user_service: UserService = Depends(get_user_service),
                        ):
    old_refresh_token = request.cookies.get("myRefresh_token")

    if not old_refresh_token:
        raise HTTPException(status_code=403, detail="Refresh token not found")

    try:
        payload = decode(old_refresh_token, USER_JWT_SECRET_KEY,
                         algorithms=[USER_JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=403, detail="Invalid refresh token")

        # Invalidate the old refresh token
        await user_service.invalidate_refresh_token(old_refresh_token)

        # Create and save tokens
        tokens = await user_service.create_and_save_tokens(user_id)

        # print(tokens, "tokenzzz")

        # Set the new refresh token in a secure HttpOnly cookie
        response.set_cookie(
            key="myRefresh_token", value=tokens["refresh_token"], httponly=True, max_age=7 * 24 * 60 * 60)

        # Return the new access token in the response body
        return {"access_token": tokens["access_token"], "message": "Access token refreshed"}
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=403, detail="Refresh token has expired")
    except PyJWTError:
        raise HTTPException(
            status_code=403, detail="Could not validate credentials")


@router.get("/dashboard")
async def dashboard():
    # Your dashboard logic here
    return {"message": "Welcome to the dashboard"}


@router.get("/user/profile", response_model=ProfileSchema)
async def user_profile(
    user: Profile = Depends(get_current_user),
    profile_service: ProfileService = Depends(get_profile_service)
):
    if not user.id:
        raise HTTPException(
            status_code=401, detail="Session invalid or expired, please login.")

    data = await profile_service.get_all_profile_info(user.id)

    return data


@router.post("/user/medical")
async def user_profile(
    user: Profile = Depends(get_current_user),
    body: ICDCodesCreate = Body(...),  # Use Body to grab the JSON payload
    user_service: UserService = Depends(get_user_service),
):
    if not user.id:
        raise HTTPException(
            status_code=401, detail="Session invalid or expired, please login.")

    data = await user_service.addMedicalCode(user.id, medical_code=body.icd10cm, description=body.description)

    return ({"data": data})


@router.post("/welcome")
async def welcome(
    form: WelcomeFormData,
    user: Profile = Depends(get_current_user),
    medical_service: MedicalService = Depends(get_medical_service),
    # goals_service: GoalService = Depends(get_goals_service),
    preferences_service: PreferenceService = Depends(get_preference_service)
):

    if not user.id:
        raise HTTPException(
            status_code=401, detail="Session invalid or expired, please login.")

    if not form.submission:
        raise HTTPException(status_code=400, detail="No submission data found")

    for answer in form.submission:
        # Convert questionId to string for prefix matching
        question_id = answer.questionId
        suggestions = answer.answers
        query_key = answer.queryKey

        # Get category based on questionId prefix
        category = RateLimitUtil.get_category_by_question_id(str(question_id))

        # Route to the appropriate service based on the category
        if category == "medical":
            await medical_service.post_medical(user.id, query_key, suggestions)
        # elif category == "goals":
        #     await goals_service.post_goals(user.id, suggestions)
        elif category == "preferences":
            await preferences_service.post_preferences(user.id, question_id, query_key, suggestions)
        else:
            # Log the unrecognized prefix and continue processing the next entry
            logging.warning(f"Unrecognized questionId prefix: {question_id}")
            continue

    return {"status": "success", "message": "Data processed successfully"}


# Assuming these services are injected using FastAPI's Depends
@router.get("/refs")
async def refs(
    queryKey: Optional[str] = Query(default=None),
    medical_service: MedicalService = Depends(get_medical_service),
    goals_service: GoalService = Depends(get_goals_service),
    preferences_service: PreferenceService = Depends(get_preference_service),
):
    # Check the queryKey and call the appropriate service
    if queryKey == "diets":
        data = await preferences_service.get_all_diet_types()
    # elif queryKey == "preferences":
    #     data = await preferences_service.getAllPreferences()
    else:
        return {"error": "Invalid query key"}

    return data


@router.post("/diet-types/", response_model=DietTypeResponse)
async def create_diet_type(
    diet_type_data: DietTypeCreate,
    preferences_service: PreferenceService = Depends(get_preference_service),

):
    existing_diet_type = await preferences_service.get_diet_type_by_name(diet_type_data.name)
    if existing_diet_type:
        raise HTTPException(status_code=400, detail="Diet type already exists")

    new_diet_type = await preferences_service.create_diet_type(
        diet_type_data
    )

    return new_diet_type


@router.get("/diet-types/", response_model=List[DietTypeResponse])
async def get_all_diet_types(
    preferences_service: PreferenceService = Depends(get_preference_service)
):
    return await preferences_service.get_all_diet_types()


