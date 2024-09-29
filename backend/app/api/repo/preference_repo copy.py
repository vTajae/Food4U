
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.models.food4u.meals import DietType, MealType
from app.api.models.food4u.user import ProfileAttribute, ProfileDiet
from app.api.schemas.food4u.food import DietTypeCreate, MealTypeCreate
from app.api.models.food4u.medical import Allergen, IntoleranceType
from app.api.schemas.food4u.medical import AllergenCreate, AllergenUpdate, DietTypeUpdate, IntoleranceCreate, IntoleranceUpdate
from app.api.utils.utils import _strip_timezone


class PreferenceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Attributes

    # Method to add an attribute if it doesn't exist
    async def add_profile_attribute(self, profile_id: int, attribute_data: ProfileAttribute) -> ProfileAttribute:
        """
        Adds an attribute (e.g., diet, allergen, intolerance) to the profile if it doesn't exist.
        """
        query = select(ProfileAttribute).where(
            ProfileAttribute.profile_id == profile_id,
            ProfileAttribute.attribute_category == attribute_data.attribute_category,
            ProfileAttribute.attribute_name == attribute_data.attribute_name,
            ProfileAttribute.attribute_value == attribute_data.attribute_value

        )
        result = await self.db.execute(query)
        attribute: Optional[ProfileAttribute] = result.scalars().first()

        if not attribute:

            created_at = _strip_timezone(self,datetime.now(timezone.utc))
            updated_at = _strip_timezone(self,datetime.now(timezone.utc))

            new_attribute = ProfileAttribute(
                profile_id=profile_id,
                attribute_category=attribute_data.attribute_category,
                attribute_name=attribute_data.attribute_name,
                attribute_value=attribute_data.attribute_value,
                notes=attribute_data.notes,
                created_at=created_at,
                updated_at=updated_at
            )
            self.db.add(new_attribute)
            await self.db.commit()
            await self.db.refresh(new_attribute)
            return new_attribute

        return attribute
    

    # Method to get all attributes for a profile by category (strict typing)
    async def get_attributes_by_category(self, profile_id: int, category: str) -> List[ProfileAttribute]:
        """
        Fetches all attributes (e.g., diets, allergens, intolerances) linked to a profile for a given category.
        """
        query = select(ProfileAttribute).where(
            ProfileAttribute.profile_id == profile_id,
            ProfileAttribute.attribute_category == category
        ).options(joinedload(ProfileAttribute.profile))

        result = await self.db.execute(query)
        attributes: List[ProfileAttribute] = result.scalars().all()
        return attributes

    # Method to delete a specific attribute
    async def delete_attribute(self, profile_id: int, category: str, attribute_id: int) -> None:
        """
        Deletes a specific attribute (e.g., diet, allergen, intolerance) linked to a profile.
        """
        stmt = select(ProfileAttribute).where(
            ProfileAttribute.profile_id == profile_id,
            ProfileAttribute.attribute_category == category,
            ProfileAttribute.attribute_id == attribute_id
        )
        result = await self.db.execute(stmt)
        attribute: Optional[ProfileAttribute] = result.scalars().first()

        if attribute:
            await self.db.delete(attribute)
            await self.db.commit()

    # Method to bulk add attributes to a profile
    async def bulk_add_attributes(self, profile_id: int, attributes: List[ProfileAttribute]) -> None:
        """
        Adds multiple attributes to a profile. Skips adding if the attribute already exists.
        """
        for attribute_data in attributes:
            await self.add_attribute(profile_id, attribute_data)
        await self.db.commit()

    # Method to add a meal type if it doesn't exist

    async def add_meal_type(self, meal_type_data: MealTypeCreate) -> MealType:
        query = select(MealType).where(
            MealType.MealTypeName == meal_type_data.MealTypeName)
        result = await self.db.execute(query)
        meal_type = result.scalars().first()

        if not meal_type:
            new_meal_type = MealType(
                MealTypeName=meal_type_data.MealTypeName
            )
            self.db.add(new_meal_type)
            await self.db.commit()
            return new_meal_type

        return meal_type

    async def get_all_diets(self):
        # Query to get all diet entries
        query = select(DietType)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_all_intolerances(self):
        # Query to get all intolerance entries
        query = select(IntoleranceType)
        result = await self.db.execute(query)
        return result.scalars().all()

    # DIETS

    async def create_diet_type(self, diet_data: DietTypeCreate) -> DietType:
        new_diet = DietType(
            diet_name=diet_data.name,
            description=diet_data.description
        )
        self.db.add(new_diet)
        await self.db.commit()
        await self.db.refresh(new_diet)
        return new_diet

    async def get_diet_by_id(self, diet_type_id: int) -> Optional[DietType]:
        query = select(DietType).where(DietType.id == diet_type_id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def update_diet_type(self, diet_type_id: int, diet_data: DietTypeUpdate) -> DietType:
        query = (
            update(DietType)
            .where(DietType.id == diet_type_id)
            .values(**diet_data.model_dump(exclude_unset=True))
            .returning(DietType)
        )
        result = await self.db.execute(query)
        await self.db.commit()
        return result.scalars().first()

    async def delete_diet_type(self, diet_type_id: int):
        query = delete(DietType).where(DietType.id == diet_type_id)
        await self.db.execute(query)
        await self.db.commit()

    async def bulk_update_diet_types(self, diets: List[DietTypeUpdate]):
        for diet in diets:
            await self.update_diet(diet.diet_type_id, diet)
        await self.db.commit()

    async def get_all_diet_types(self) -> List[DietType]:
        query = select(DietType)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_diet_type_by_name(self, diet_name: str) -> Optional[DietType]:
        """
        Fetches a diet type by its name.
        """
        query = select(DietType).where(DietType.diet_name == diet_name)
        result = await self.db.execute(query)
        return result.scalars().first()


# Update user cuisine preferences

    # Get all diet types


    async def get_diet_type_by_name(self, diet_name: str) -> Optional[DietType]:
        query = select(DietType).where(DietType.diet_name == diet_name)
        result = await self.db.execute(query)
        return result.scalars().first()

    # Get all diet preferences for a profile
    async def get_profile_diets(self, profile_id: int) -> List[DietType]:
        query = (
            select(DietType)
            .join(ProfileDiet, ProfileDiet.diet_type_id == DietType.id)
            .where(ProfileDiet.profile_id == profile_id)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    # Create or link a diet type to a profile (Linkage method)
    async def link_profile_to_diet(self, profile_id: int, diet_name: str) -> None:
        # Get the diet type by name
        diet_type = await self.get_diet_type_by_name(diet_name)

        if not diet_type:
            raise ValueError(f"Diet type '{diet_name}' does not exist")

        # Check if the diet is already linked to the profile
        query = select(ProfileDiet).where(
            ProfileDiet.profile_id == profile_id,
            ProfileDiet.diet_type_id == diet_type.id
        )
        result = await self.db.execute(query)
        profile_diet: Optional[ProfileDiet] = result.scalars().first()

        if not profile_diet:
            # Link diet to profile if not already linked
            new_profile_diet = ProfileDiet(
                profile_id=profile_id,
                diet_type_id=diet_type.id
            )
            self.db.add(new_profile_diet)
            await self.db.commit()

    # Delete a diet preference for a profile
    async def unlink_profile_from_diet(self, profile_id: int, diet_name: str) -> None:
        # Get the diet type by name
        diet_type = await self.get_diet_type_by_name(diet_name)

        if not diet_type:
            raise ValueError(f"Diet type '{diet_name}' does not exist")

        # Delete the diet link for the profile
        query = delete(ProfileDiet).where(
            ProfileDiet.profile_id == profile_id,
            ProfileDiet.diet_type_id == diet_type.id
        )
        await self.db.execute(query)
        await self.db.commit()

    # Bulk link multiple diet types to a profile
    async def bulk_link_profile_to_diets(self, profile_id: int, diet_names: List[str]) -> None:
        for diet_name in diet_names:
            await self.link_profile_to_diet(profile_id, diet_name)
        await self.db.commit()

    # Bulk unlink multiple diet types from a profile
    async def bulk_unlink_profile_from_diets(self, profile_id: int, diet_names: List[str]) -> None:
        for diet_name in diet_names:
            await self.unlink_profile_from_diet(profile_id, diet_name)
        await self.db.commit()


# CUSINES

