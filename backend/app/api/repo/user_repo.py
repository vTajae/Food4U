from typing import Optional
from fastapi import Depends
from sqlalchemy import insert, select,join
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload


from app.api.models.food4u.user import Profile, ProfileDiet, ProfileMealPreferences, ProfilePreference
from app.api.models.food4u.medical import ICDCodes, PatientMedicalHistory


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
    
# Method to add a medical code if it doesn't exist
    async def addMedicalCode(self, medical_code: str, description: str) -> ICDCodes:
        # Check if the medical code already exists
        stmt = select(ICDCodes).where(ICDCodes.code == medical_code)
        result = await self.db.execute(stmt)
        existing_code = result.scalars().first()

        # If the medical code doesn't exist, ProfileDietinsert it
        if not existing_code:
            stmt = insert(ICDCodes).values(code=medical_code, description=description)
            await self.db.execute(stmt)
            await self.db.commit()

        return existing_code if existing_code else {"code": medical_code, "description": description}

    # Method to associate a medical code with the user's profile
    async def LinkMedicalCodeToUser(self, profile_id: str, medical_code: str):
        # Check if the medical code is already associated with the user's profile
        stmt = select(PatientMedicalHistory).where(
            PatientMedicalHistory.profile_id == profile_id,
            PatientMedicalHistory.icd_code == medical_code
        )
        result = await self.db.execute(stmt)
        existing_association = result.scalars().first()

        # If the association doesn't exist, create it
        if not existing_association:
            stmt = insert(PatientMedicalHistory).values(
                profile_id=profile_id, icd_code=medical_code
            )
            await self.db.execute(stmt)
            await self.db.commit()

        return existing_association if existing_association else {"profile_id": profile_id, "medical_code": medical_code}       

