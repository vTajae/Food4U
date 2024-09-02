from app.api.repo.auth_repo import AuthRepository
from app.api.repo.user_repo import UserRepository
from fastapi import Depends
from app.config.database import AsyncSession, async_database_session
from app.api.services.user_service import UserService


# Dependency for UserService with a repository
async def get_user_service(db: AsyncSession = Depends(async_database_session.get_session)) -> UserService:
    user_repo = UserRepository(db)
    auth_repo = AuthRepository(db)  # Create an instance of AuthRepository
    return UserService(user_repo, auth_repo)

