from typing import List
from app.api.repo.preference_repo import PreferenceRepository
from app.api.schemas.food4u.welcome import Suggestion
from app.api.models.food4u.meals import DietType
from app.api.schemas.food4u.food import DietTypeCreate
from app.api.schemas.food4u.medical import DietTypeUpdate


class PreferenceService:
    def __init__(self, repo: PreferenceRepository):
        self.repo = repo

    async def update_cuisine_preferences(self, profile_id: int, cuisines: List[str]):
        await self.repo.updateUserCuisinePreferences(profile_id, cuisines)


# Bulk update cuisine preferences and price


    async def post_preferences(self, profile_id: str, question_id: int, query_key: str, suggestions: List[Suggestion]):
        if query_key == "cuisines":
            cuisine_names = [suggestion.name for suggestion in suggestions]

            # Route based on the question_id
            if question_id == 5:  # Liked cuisines
                await self.repo.updateUserCuisinePreferences(profile_id, cuisine_names, "like")
            elif question_id == 55:  # Disliked cuisines
                await self.repo.updateUserCuisinePreferences(profile_id, cuisine_names, "dislike")

        # elif query_key == "diets" and question_id == 5555:  # Diet preferences
        #     for suggestion in suggestions:
        #         await self.repo.updateUserDiet(profile_id, suggestion.name)

        # elif query_key == "price" and question_id == 555:  # Price preferences
        #     for suggestion in suggestions:
        #         await self.repo.updateUserPricePreferences(profile_id, suggestion.value)
        else:
            return {"error": "Invalid query key"}

    async def create_diet_type(self, diet_data: DietTypeCreate):
        return await self.repo.create_diet_type(diet_data)

    async def update_diet_type(self, diet_type_id: int, diet_data: DietTypeUpdate):
        return await self.repo.update_diet_type(diet_type_id, diet_data)

    async def delete_diet_type(self, diet_type_id: int):
        await self.repo.delete_diet_type(diet_type_id)

    async def bulk_update_diet_types(self, diets: List[DietTypeUpdate]):
        await self.repo.bulk_update_diet_types(diets)

    async def get_all_diet_types(self) -> List[DietType]:
        return await self.repo.get_all_diet_types()

    async def get_diet_type_by_name(self, diet_name: str):
        """
        Fetches the diet type by name.
        """
        return await self.repo.get_diet_type_by_name(diet_name)
