# Dependency for shared session
from fastapi import Depends

from app.config.database import AsyncDatabaseSession, async_database_session
from app.api.repo.auth_repo import AuthRepository
from app.api.repo.profile_repo import ProfileRepository
from app.api.services.user_service import UserService
from sqlalchemy.ext.asyncio import AsyncSession


# Dependency for shared session
from typing import AsyncGenerator

# Dependency for shared session
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_database_session.get_session() as session:
        yield session  # Session will be automatically closed after use



# Dependency for UserService with ProfileRepository and AuthRepository using shared session
async def get_user_service(db=Depends(get_db_session)) -> UserService:

    user_repo = ProfileRepository(db)
    auth_repo = AuthRepository(db)
    
    return UserService(user_repo, auth_repo)