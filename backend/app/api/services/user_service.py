import os
import jwt
from typing import Optional
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from app.api.models.food4u.user import Profile
from app.api.repo.auth_repo import AuthRepository
from app.api.repo.profile_repo import ProfileRepository


load_dotenv()

USER_JWT_SECRET_KEY = os.getenv('USER_JWT_SECRET_KEY')
USER_JWT_ALGORITHM = os.getenv('USER_JWT_ALGORITHM')
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv(
    'JWT_ACCESS_TOKEN_EXPIRE_MINUTES')


class UserService:
    def __init__(self, user_repo: ProfileRepository, auth_repo: AuthRepository):
        self.user_repo = user_repo
        self.auth_repo = auth_repo

    async def invalidate_refresh_token(self, token: str):
        return await self.auth_repo.invalidate_token(token)

    async def create_profile(self, userId: int) -> Optional[Profile]:
        existing_user = await self.user_repo.get_profile_by_id(userId)
        if existing_user:
            return existing_user

        user = Profile(id=userId)
        new_user = await self.user_repo.add_user(user)

        return new_user  # Will be None if creation failed

    def generate_jwt_token(self, user_id: int):
        return jwt.encode({"user_id": user_id}, USER_JWT_SECRET_KEY, algorithm=USER_JWT_ALGORITHM)

    async def get_profile_by_id(self, user_id: int) -> Profile:
        return await self.user_repo.get_profile_by_id(user_id)

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

