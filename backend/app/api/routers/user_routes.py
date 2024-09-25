import os
from dotenv import load_dotenv
from fastapi import APIRouter, Body
from fastapi_limiter.depends import RateLimiter
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from jwt import ExpiredSignatureError, InvalidSignatureError, PyJWTError, decode
from app.api.dependencies.auth_dep import get_current_user
from app.api.dependencies.user_dep import get_user_service
from app.api.dependencies.rate_limit_dep import rate_limit_middleware
from app.api.schemas.food4u.user import UserLoginSchema, UserModel, UserRegisterSchema, UserResponse
from app.api.schemas.food4u.medical import MedicalPost
from app.api.services.user_service import UserService
from app.api.models.food4u.user import Profile

router = APIRouter()

load_dotenv()

USER_JWT_SECRET_KEY = os.getenv('USER_JWT_SECRET_KEY')
USER_JWT_ALGORITHM = os.getenv('USER_JWT_ALGORITHM')

# Profile creation endpoint


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
        profile = await service.create_profile(userId=str(user_id))

        print(profile, "profile")

        if profile:
            return profile  # FastAPI will serialize this using the response_model
        else:
            raise HTTPException(
                status_code=400, detail="Profile creation failed")

    except InvalidSignatureError:
        raise HTTPException(status_code=401, detail="Could not validate token")


@router.post("/register")
async def register_user(user_data: UserRegisterSchema, service: UserService = Depends(get_user_service)):
    print(user_data, "user_data")
    if await service.register_user(user_data.username, user_data.password):
        return {"message": "Profile registered successfully"}
    else:
        raise HTTPException(status_code=400, detail="Username already exists")


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


@router.get("/user/profile", response_model=UserModel)
async def user_profile(
    user: Profile = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    if not user.id:
        raise HTTPException(
            status_code=401, detail="Session invalid or expired, please login.")

    data = await user_service.get_user_by_id(user.id)

    return data


@router.post("/user/medical")
async def user_profile(
    user: Profile = Depends(get_current_user),
    body: MedicalPost = Body(...),  # Use Body to grab the JSON payload
    user_service: UserService = Depends(get_user_service),
):
    if not user.id:
        raise HTTPException(
            status_code=401, detail="Session invalid or expired, please login.")
        
        
    data = await user_service.addMedicalCode(user.id, medical_code=body.icd10cm, description=body.description)

    return ({"data": data})


@router.post("/user/preferences")
async def user_profile(
    user: Profile = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    if not user.id:
        raise HTTPException(
            status_code=401, detail="Session invalid or expired, please login.")
        
        
    print(user.id, "user.id")

    return await user_service.updatePreferences(user.id)



@router.post("/welcome")
async def user_profile(
    user: Profile = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    if not user.id:
        raise HTTPException(
            status_code=401, detail="Session invalid or expired, please login.")
        
        
    print(user.id, "user.id")

    return await user_service.updatePreferences(user.id)

