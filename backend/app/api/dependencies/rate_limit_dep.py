from fastapi import Request
from app.config.database import async_database_session
from app.api.services.food4u.rate_limiter import rate_limiter

async def rate_limit_middleware(request: Request):
    async with async_database_session.get_session() as session:
        await rate_limiter(request, session)
