from typing import Optional
from fastapi import Depends
from sqlalchemy import select,join
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload


from app.api.schemas.user_schema import PatientMedicalHistory, Profile, ProfileDiet, ProfileMealPreferences, ProfilePreference


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, id: str):
        stmt = select(Profile).where(Profile.id == id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def add_user(self, user: Profile) -> Optional[Profile]:
            try:
                self.db.add(user)
                await self.db.commit()
                await self.db.refresh(user)
                return user
            except IntegrityError:
                await self.db.rollback()  # Rollback on error
                return None
            
    async def user_exists(self, id: str):
        stmt = select(Profile).where(Profile.id == id)
        result = await self.db.execute(stmt)
        return result.scalars().first() is not None
    

    # Fetch all related data for a given user (profile) by ID
    async def get_user_full_data(self,profile_id: str):
        stmt = (
            select(Profile)
            .where(Profile.id == profile_id)
            .options(
                # Eager load all related data
                joinedload(Profile.vitals),
                joinedload(Profile.attributes),
                joinedload(Profile.medical_history).joinedload(PatientMedicalHistory.icd_codes),  # Include ICD codes
                joinedload(Profile.diets).joinedload(ProfileDiet.diet_type),  # Include diet type
                joinedload(Profile.meal_preferences).joinedload(ProfileMealPreferences.meal),  # Include meal details
                joinedload(Profile.preferences).joinedload(ProfilePreference.meal_type),  # Include meal type preferences
            )
        )

        result = await self.db.execute(stmt)
        profile = result.scalars().first()
        self.db.close()
        return profile

