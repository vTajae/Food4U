from fastapi import Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timezone
from app.config.database import async_database_session
from app.api.schemas.rate_schema import RateLimit  # Your DB session manager

# Rate limiting configuration
RATE_LIMIT = 5  # Allow 5 requests
RATE_LIMIT_WINDOW = 1  # Window of 60 seconds

async def rate_limiter(request: Request, session: AsyncSession):
    identifier = request.client.host  # You can also use user IDs here if you prefer
    current_time = datetime.now(timezone.utc)  # Use timezone-aware datetime
    # Query the database to find the rate limit entry for this identifier (IP/user)
    stmt = select(RateLimit).where(RateLimit.identifier == identifier)
    result = await session.execute(stmt)
    rate_limit = result.scalar_one_or_none()

    if rate_limit:
        # If a record exists, check the time difference and request count
        time_diff = (current_time - rate_limit.last_request).total_seconds()

        if time_diff < RATE_LIMIT_WINDOW:
            # Inside the time window, check if the request count exceeds the limit
            if rate_limit.request_count >= RATE_LIMIT:
                raise HTTPException(status_code=429, detail="Too many requests")
            else:
                # Update the request count
                rate_limit.request_count += 1
        else:
            # Outside the time window, reset the request count
            rate_limit.request_count = 1
            rate_limit.last_request = current_time
    else:
        # If no record exists, create a new one for this identifier
        rate_limit = RateLimit(
            identifier=identifier,
            request_count=1,
            last_request=current_time
        )
        session.add(rate_limit)

    # Commit the changes to the database
    await session.commit()
