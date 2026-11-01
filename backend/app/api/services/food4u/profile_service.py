from typing import List
from sqlalchemy import insert, select
from app.api.repo.profile_repo import ProfileRepository
from app.api.schemas.food4u.welcome import Answer, Suggestion, WelcomeFormData
from app.api.models.food4u.user import Profile, ProfileAttribute, ProfileDiet
from app.api.utils.utils import RateLimitUtil

from app.api.schemas.food4u.profile import ProfileSchema

class ProfileService:
    def __init__(self, profile_repo: ProfileRepository):
        self.profile_repo = profile_repo


    # async def get_meals_for_profile(self, profile_id: int):
    #     return await self.meal_repo.getMealsForProfile(profile_id)
    
    
    async def get_all_profile_info(self, profile_id: int) -> ProfileSchema:
       return await self.profile_repo.get_all_profile_info(profile_id)
        

    
