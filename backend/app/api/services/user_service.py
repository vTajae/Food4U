import os
import jwt
from typing import Optional
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from app.api.repo.user_repo import UserRepository
from app.api.models.food4u.user import Profile
from app.api.repo.auth_repo import AuthRepository


load_dotenv()

USER_JWT_SECRET_KEY = os.getenv('USER_JWT_SECRET_KEY')
USER_JWT_ALGORITHM = os.getenv('USER_JWT_ALGORITHM')
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv(
    'JWT_ACCESS_TOKEN_EXPIRE_MINUTES')


class UserService:
    def __init__(self, user_repo: UserRepository, auth_repo: AuthRepository):
        self.user_repo = user_repo
        self.auth_repo = auth_repo

    async def invalidate_refresh_token(self, token: str):
        return await self.auth_repo.invalidate_token(token)

    async def get_user_by_id(self, id: str):
        return await self.user_repo.get_user_by_id(id)

    async def create_profile(self, userId: str) -> Optional[Profile]:
        existing_user = await self.user_repo.get_user_by_id(userId)
        if existing_user:
            return existing_user

        user = Profile(id=userId)
        new_user = await self.user_repo.add_user(user)

        return new_user  # Will be None if creation failed

    # async def register_user(self,username: str, password: str):
    #     if await self.user_repo.user_exists(username):
    #         return False
    #     hashed_password = bcrypt.hashpw(
    #         password.encode('utf-8'), bcrypt.gensalt())
    #     # Decode the hashed password to a UTF-8 string
    #     decoded_hashed_password = hashed_password.decode('utf-8')
    #     user = Profile(username=username, hashed_password=decoded_hashed_password)
    #     return await self.user_repo.add_user(user)

    def generate_jwt_token(self, user_id: str):
        return jwt.encode({"user_id": user_id}, USER_JWT_SECRET_KEY, algorithm=USER_JWT_ALGORITHM)

    # async def login_user(self, id: str, password: str) -> Optional[Profile]:
    #     user = await self.user_repo.get_user_by_id(id)
    #     # print(f"Profile: {user}")
    #     if user is None:
    #         return None
    #     # Verify the password using bcrypt
    #     if not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
    #         return None
    #     return user

    async def get_user_by_id(self, user_id: str) -> Profile:
        return await self.user_repo.get_user_by_id(user_id)

    def create_a_token(self, data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(tz=timezone.utc) + expires_delta
        else:
            # Short lifespan for access token
            expire = datetime.now(tz=timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, USER_JWT_SECRET_KEY, algorithm=USER_JWT_ALGORITHM)
        return encoded_jwt

    async def create_and_save_tokens(self, user_id: str):
        # Token expiration times
        access_token_expires = timedelta(minutes=60)
        refresh_token_expires = timedelta(days=7)

        # Create access and refresh tokens
        access_token = self.create_a_token(
            data={"user_id": user_id}, expires_delta=access_token_expires)
        refresh_token = self.create_a_token(
            data={"user_id": user_id}, expires_delta=refresh_token_expires)

        # # # Save tokens to database
        # await self.auth_repo.add_token(access_token, user_id, datetime.utcnow() + access_token_expires, TokenType.ACCESS)
        # await self.auth_repo.add_token(refresh_token, user_id, datetime.utcnow() + refresh_token_expires, TokenType.REFRESH)

        return {"access_token": access_token, "refresh_token": refresh_token}

    async def updatePreferences(self, data: dict):
        # Add to profile (Ethnicity,Medical Condition, Age, Favoraite Meal: Breafkast,Lunch, Dinner, Snack )

        return "Preferences Updated"

    async def addMedicalCode(self, profile_id: str, medical_code: str, description: str):
        # First, ensure the medical code is in the database
        await self.user_repo.addMedicalCode(medical_code, description)

        # Then, associate the medical code with the user profile
        await self.user_repo.LinkMedicalCodeToUser(profile_id, medical_code)

        # Return a success message
        return {"status": "success", "message": f"Medical code {medical_code} has been added and linked to the user."}

    # async def addMedicalCode(self, profile_id: str, medical_code: str, description: str):
    #         # First, ensure the medical code is in the database
    #         await self.user_repo.addMedicalCode(medical_code, description)

    #         # Then, associate the medical code with the user profile
    #         await self.user_repo.LinkMedicalCodeToUser(profile_id, medical_code)

    #         # Return a success message
    #         return {"status": "success", "message": f"Medical code {medical_code} has been added and linked to the user."}

    # async def addMedicalCode(self, profile_id: str, medical_code: str, description: str):
    #         # First, ensure the medical code is in the database
    #         await self.user_repo.addMedicalCode(medical_code, description)

    #         # Then, associate the medical code with the user profile
    #         await self.user_repo.LinkMedicalCodeToUser(profile_id, medical_code)

    #         # Return a success message
    #         return {"status": "success", "message": f"Medical code {medical_code} has been added and linked to the user."}
