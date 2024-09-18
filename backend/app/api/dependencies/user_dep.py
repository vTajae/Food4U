from app.api.repo.auth_repo import AuthRepository
from app.api.repo.user_repo import UserRepository
from fastapi import Depends
from app.config.database import AsyncSession, async_database_session
from app.api.services.user_service import UserService


# Dependency for UserService with a repository
async def get_user_service() -> UserService:
     async with async_database_session.get_session() as db:
        user_repo = UserRepository(db)
        auth_repo = AuthRepository(db)
        return UserService(user_repo, auth_repo)