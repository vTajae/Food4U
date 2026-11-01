from fastapi import HTTPException, Request
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.api.models.food4u.user import Profile
from app.api.repo.auth_repo import AuthRepository
from app.api.repo.profile_repo import ProfileRepository


# Rate limiting configuration
RATE_LIMIT = 5  # Allow 5 requests
RATE_LIMIT_WINDOW = 1  # Window in seconds


class UserService:
    def __init__(self, user_repo: ProfileRepository, auth_repo: AuthRepository):
        self.user_repo = user_repo
        self.auth_repo = auth_repo

    async def create_profile(self, public_id: str) -> Optional[Profile]:
        """Create-or-get the profile for a public id. The integer `id` is internal
        (DB default); it never leaves the backend as an identity."""
        existing = await self.user_repo.get_profile_by_public_id(public_id)
        if existing:
            return existing

        new_user = await self.user_repo.add_user(Profile(public_id=public_id))
        if new_user is None:
            # Lost a race with a concurrent create: the row exists now.
            new_user = await self.user_repo.get_profile_by_public_id(public_id)
        return new_user

    async def get_profile_by_public_id(self, public_id: str) -> Optional[Profile]:
        return await self.user_repo.get_profile_by_public_id(public_id)

    async def get_profile_by_id(self, user_id: int) -> Profile:
        return await self.user_repo.get_profile_by_id(user_id)

    async def rate_limiter(self, request: Request) -> bool:
        # Local import avoids the auth dependency -> UserService import cycle.
        from app.api.dependencies.auth_dep import verified_public_id

        try:
            identifier = f"user:{verified_public_id(request)}"
        except HTTPException:
            # Invalid/missing bearers share the host budget, never claimed IDs.
            identifier = f"ip:{request.client.host if request.client else 'unknown'}"
        current_time = datetime.now(timezone.utc)

        # Calculate window boundary
        window_start = current_time - timedelta(seconds=RATE_LIMIT_WINDOW)

        # Call the repository method to handle the database operations
        response = await self.auth_repo.ratelimiter(identifier, current_time, window_start)

        # Extract values from the response
        request_count = response.request_count
        last_request = response.last_request
        
        # Check if the request is within the allowed window
        return not (last_request > window_start and request_count > RATE_LIMIT)
