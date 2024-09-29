import datetime
from app.api.enums.token import TokenType
from app.api.models.food4u.auth import Token
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.api.models.food4u.ratelimit import RateLimit


class AuthRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_token(self, token: str, user_id: int, expiry_date: datetime, token_type: TokenType):
        new_token = Token(token=token, user_id=user_id,
                          expiry_date=expiry_date, token_type=token_type)
        self.db.add(new_token)
        try:
            await self.db.commit()
        except IntegrityError:
            await self.db.rollback()
            raise

    async def invalidate_token(self, token: str):
        await self.db.execute(
            update(Token)
            .where(Token.token == token)
            .values(is_active=False)
        )
        await self.db.commit()

    async def find_token(self, token: str):
        result = await self.db.execute(
            select(Token)
            .where(Token.token == token, Token.is_active == True)
        )
        return result.scalars().first()

    async def find_active_token_by_user(self, user_id: int, token_type: TokenType):
        result = await self.db.execute(
            select(Token)
            .where(Token.user_id == user_id, Token.token_type == token_type, Token.is_active == True)
        )
        return result.scalars().first()


    async def getPing(self, identifier: str):
        stmt = select(RateLimit).where(RateLimit.identifier == identifier)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def ping(self,identifier: str):
        current_time = datetime.now(datetime.timezone.utc)
        # If no record exists, create a new one for this identifier
        rate_limit = RateLimit(
            identifier=identifier,
            request_count=1,
            last_request=current_time
        )
        result = self.db.add(rate_limit)
        
        if result:
            try:
                await self.db.commit()
            except IntegrityError:
                await self.db.rollback()
                raise
            else: 
                return LookupError("No record exists")
