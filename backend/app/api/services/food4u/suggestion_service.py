from typing import List
from app.api.repo.profile_repo import ProfileRepository
from app.api.repo.meal_repo import MealRepository
from app.api.repo.ai_repo import AIRepository
from app.api.schemas.food4u.suggestion import SuggestionRequest


class SuggestionService:
    def __init__(self, profile_repo: ProfileRepository, meal_repo: MealRepository, ai_repo: AIRepository):
        self.profile_repo = profile_repo
        self.meal_repo = meal_repo
        self.ai_repo = ai_repo

    async def get_general_suggestion(self, data: SuggestionRequest):
        # Extract relevant information from the user input (data)
        query_text = data.queryKey  # Assuming 'query' is a field in SuggestionRequest

        # Query LlamaIndex through the AIRepository
        result = self.ai_repo.query(query_text)

        # Return the result to the user
        return result
         
        
    
    
    
    
    
    