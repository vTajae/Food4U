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

    async def welcome(self, profile_id: str, form: WelcomeFormData):

        print(form, "form")

        for answer in form.submission:
            # Convert questionId to string for prefix matching
            question_id = str(answer.questionId)
            suggestions = answer.answers
            query_key = answer.queryKey
            
            category = RateLimitUtil.get_category_by_question_id(question_id)

                # Route to the appropriate service based on the category
            if category == "medical":
                await self.medical_service.post_medical(profile_id, query_key, suggestions)
            elif category == "goals":
                await self.goals_service.post_goals(profile_id, suggestions)
            elif category == "food":
                await self.preferences_service.post_preferences(profile_id, "food", suggestions)
            elif category == "preferences":
                await self.preferences_service.post_preferences(profile_id, query_key, suggestions)
            elif category == "mealPlans":
                await self.mealplans_service.post_mealplans(profile_id, suggestions)
            elif category == "suggestions":
                await self.suggestions_service.post_suggestions(profile_id, suggestions)
            else:
                # Handle unrecognized questionId prefix or return an empty response if needed
                continue

        return {"status": "success", "message": "Data processed successfully"}

    async def get_meals_for_profile(self, profile_id: int):
        return await self.meal_repo.getMealsForProfile(profile_id)
    
    
    async def get_all_profile_info(self, profile_id: int) -> ProfileSchema:
       return await self.profile_repo.get_all_profile_info(profile_id)
        

    
