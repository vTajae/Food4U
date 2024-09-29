# Dependency for shared session
from fastapi import Depends, Request

from app.config.database import async_database_session
from app.api.repo.auth_repo import AuthRepository
from app.api.repo.profile_repo import ProfileRepository
from app.api.services.user_service import UserService
from app.api.utils.utils import rate_limiter


async def get_db_session():
    async with async_database_session.get_session() as session:
        yield session


# Rate limiter middleware using shared session
async def rate_limit_middleware(request: Request, session=Depends(get_db_session)):
    # Execute rate limiter logic using shared session
    await rate_limiter(request, session)


# Dependency for UserService with ProfileRepository and AuthRepository using shared session
async def get_user_service(db=Depends(get_db_session)) -> UserService:
    user_repo = ProfileRepository(db)
    auth_repo = AuthRepository(db)
    
    return UserService(user_repo, auth_repo)