from typing import List
from app.api.repo.profile_repo import ProfileRepository
from app.api.repo.meal_repo import MealRepository


class SuggestionService:
    def __init__(self, profile_repo: ProfileRepository, meal_repo: MealRepository):
        self.profile_repo = profile_repo
        self.meal_repo = meal_repo

    async def get_general_suggestion(self, profile_id: str):
        test = await self.profile_repo.get_all_profile_info(profile_id)
        
        
    
    
    
    
    
    