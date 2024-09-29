from typing import Optional
from fastapi import Depends
from sqlalchemy import insert, select, join
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload


from app.api.models.food4u.user import Profile, ProfileAttribute, ProfileDiet
from app.api.models.food4u.medical import ICDCodes, PatientMedicalHistory
from app.api.schemas.food4u.profile import ProfileCreate, ProfileSchema
from app.api.models.food4u.meals import DietType, MealType
from app.api.schemas.food4u.food import DietTypeCreate, MealTypeCreate
from app.api.schemas.food4u.medical import AllergenCreate, ICDCodesCreate, IntoleranceCreate


class ProfileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile_by_id(self, id: str):
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
            await self.db.rollback()
            return None

    async def profile_exists(self, id: str):
        stmt = select(Profile).where(Profile.id == id)
        result = await self.db.execute(stmt)
        return result.scalars().first() is not None

    async def get_profile_full_data(self, profile_id: str):
        stmt = (
            select(Profile)
            .where(Profile.id == profile_id)
            .options(
                # Eager load all related data
                joinedload(Profile.vitals),
                joinedload(Profile.attributes),
                joinedload(Profile.medical_history).joinedload(
                    PatientMedicalHistory.icd_codes),  # Include ICD codes
                joinedload(Profile.diets).joinedload(
                    ProfileDiet.diet_type)  # Include diet type
            ))

        result = await self.db.execute(stmt)
        profile = result.scalars().first()
        self.db.close()
        return profile

     # Method to add a profile if it doesn't exist

    async def add_profile(self, profile_data: ProfileCreate) -> Profile:
        query = select(Profile).where(
            Profile.ProfileID == profile_data.ProfileID)
        result = await self.db.execute(query)
        profile = result.scalars().first()

        if not profile:
            new_profile = Profile(
                ProfileID=profile_data.ProfileID,
                Age=profile_data.Age,
                Ethnicity=profile_data.Ethnicity,
                Location=profile_data.Location,
            )
            self.db.add(new_profile)
            await self.db.commit()
            return new_profile

        return profile


    async def get_all_profile_info(self, profile_id: int) -> ProfileSchema:
        # Query profile with all related data using joinedload to fetch related entities
        result = await self.db.execute(
            select(Profile)
            .options(
                joinedload(Profile.attributes),  # Load attributes relationship
                # Load diets and related diet types
                joinedload(Profile.diets).joinedload(ProfileDiet.diet_type),
                # Load medical history relationship
                joinedload(Profile.medical_history),
            )
            .filter(Profile.id == profile_id)
        )

        # Fetch the profile instance
        profile = result.scalars().first()

        if not profile:
            return {"error": "Profile not found"}

        # Return the profile as a Pydantic model
        return profile

