from typing import List, Optional
from fastapi import Depends
from sqlalchemy import delete, insert, select, join, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.models.food4u.medical import Allergen, ICDCodes, IntoleranceType, PatientMedicalHistory
# from app.api.models.food4u.user import ProfileVitals
from app.api.schemas.food4u.medical import AllergenCreate, AllergenUpdate, ICDCodesCreate, IntoleranceCreate, IntoleranceUpdate, ProfileVitalsCreate


class MedicalRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

     # Method to add a medical code if it doesn't exist
    async def addMedicalCode(self, medical_code: str, description: str) -> ICDCodes:
        # Check if the medical code already exists
        stmt = select(ICDCodes).where(ICDCodes.code == medical_code)
        result = await self.db.execute(stmt)
        existing_code = result.scalars().first()

        # If the medical code doesn't exist, ProfileDietinsert it
        if not existing_code:
            stmt = insert(ICDCodes).values(
                code=medical_code, description=description)
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

        # Method to add vitals if they don't exist

    # async def add_vitals(self, profile_id: int, vitals_data: ProfileVitalsCreate) -> ProfileVitals:
    #     query = select(ProfileVitals).where(
    #         ProfileVitals.ProfileID == profile_id)
    #     result = await self.db.execute(query)
    #     vitals = result.scalars().first()

    #     if not vitals:
    #         new_vitals = ProfileVitals(
    #             ProfileID=profile_id,
    #             Height=vitals_data.Height,
    #             Weight=vitals_data.Weight,
    #             BloodPressure=vitals_data.BloodPressure,
    #             BMI=vitals_data.BMI,
    #             BloodOxygen=vitals_data.BloodOxygen,
    #             CaloriesTarget=vitals_data.CaloriesTarget,
    #             WeightGoal=vitals_data.WeightGoal,
    #             CaloriesConsumed=vitals_data.CaloriesConsumed,
    #             GoalStartDate=vitals_data.GoalStartDate,
    #             GoalEndDate=vitals_data.GoalEndDate,
    #         )
    #         self.db.add(new_vitals)
    #         await self.db.commit()
    #         return new_vitals

    #     return vitals

    # Method to add an ICD code if it doesn't exist
    async def add_icd_code(self, icd_data: ICDCodesCreate) -> ICDCodes:
        query = select(ICDCodes).where(ICDCodes.code == icd_data.code)
        result = await self.db.execute(query)
        icd_code = result.scalars().first()

        if not icd_code:
            new_icd_code = ICDCodes(
                code=icd_data.code,
                description=icd_data.name
            )
            self.db.add(new_icd_code)
            await self.db.commit()
            return new_icd_code

        return icd_code

      # INTOLERANCE

    # INTOLERANCE

    async def create_intolerance(self, intolerance_data: IntoleranceCreate) -> IntoleranceType:
        new_intolerance = IntoleranceType(
            intolerance_name=intolerance_data.intolerance_name,
            description=intolerance_data.description
        )
        self.db.add(new_intolerance)
        await self.db.commit()
        await self.db.refresh(new_intolerance)
        return new_intolerance

    async def update_intolerance(self, intolerance_id: int, intolerance_data: IntoleranceUpdate) -> IntoleranceType:
        query = (
            update(IntoleranceType)
            .where(IntoleranceType.id == intolerance_id)
            .values(**intolerance_data.model_dump(exclude_unset=True))
            .returning(IntoleranceType)
        )
        result = await self.db.execute(query)
        await self.db.commit()
        return result.scalars().first()

    async def delete_intolerance(self, intolerance_id: int):
        query = delete(IntoleranceType).where(
            IntoleranceType.id == intolerance_id)
        await self.db.execute(query)
        await self.db.commit()

    async def bulk_update_intolerances(self, intolerances: List[IntoleranceUpdate]):
        for intolerance in intolerances:
            await self.update_intolerance(intolerance.id, intolerance)
        await self.db.commit()

    async def get_all_intolerances(self) -> List[IntoleranceType]:
        query = select(IntoleranceType)
        result = await self.db.execute(query)
        return result.scalars().all()


# ALLERGEN

    async def create_allergen(self, allergen_data: AllergenCreate) -> Allergen:
        new_allergen = Allergen(
            allergen_name=allergen_data.allergen_name,
            description=allergen_data.description
        )
        self.db.add(new_allergen)
        await self.db.commit()
        await self.db.refresh(new_allergen)
        return new_allergen

    async def update_allergen(self, allergen_id: int, allergen_data: AllergenUpdate) -> Allergen:
        query = (
            update(Allergen)
            .where(Allergen.id == allergen_id)
            .values(**allergen_data.dict(exclude_unset=True))
            .returning(Allergen)
        )
        result = await self.db.execute(query)
        await self.db.commit()
        return result.scalars().first()

    async def delete_allergen(self, allergen_id: int):
        query = delete(Allergen).where(Allergen.id == allergen_id)
        await self.db.execute(query)
        await self.db.commit()

    async def bulk_update_allergens(self, allergens: List[AllergenUpdate]):
        for allergen in allergens:
            await self.update_allergen(allergen.id, allergen)
        await self.db.commit()

    async def get_all_allergens(self) -> List[Allergen]:
        query = select(Allergen)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    
    
    
    