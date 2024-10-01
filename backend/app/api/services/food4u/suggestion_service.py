from typing import List, Optional
from app.api.repo.profile_repo import ProfileRepository
from app.api.repo.meal_repo import MealRepository
from app.api.repo.ai_repo import AIRepository
from app.api.schemas.food4u.suggestion import SuggestionRequest
from app.api.schemas.food4u.profile import ProfileSchema


class SuggestionService:
    def __init__(self, profile_repo: ProfileRepository, meal_repo: MealRepository, ai_repo: AIRepository):
        self.profile_repo = profile_repo
        self.meal_repo = meal_repo
        self.ai_repo = ai_repo

    async def get_general_message(self, data: str):
        # Query LlamaIndex through the AIRepository
        result = self.ai_repo.generate_summary(data)
        # Return the result to the user
        return result
            
    # SuggestionService function to call the AI engine and generate a food suggestion
    async def get_general_message2(self, data: ProfileSchema) -> Optional[str]:
        """
        Generate a food suggestion based on user profile data.
        """

        # Serialize user data into a readable string format for the AI prompt
        profile_data_string = f"""
        User Profile:
        Age: {data.age}
        Athnicity: {data.ethnicity}
        Dietary Preferences: {', '.join([attr.attribute_name for attr in data.attributes]) if data.attributes else 'None'}
        Dietary Restrictions: {', '.join([history.icd_details.description for history in data.medical_history]) if data.medical_history else 'None'}
        """

        # AI prompt to generate a food suggestion based on profile data
        prompt = f"""
        Please generate a food item that the user can eat based on the following profile data:
        {profile_data_string}
        Keep the response short and concise. The result should be a food item.
        """

        # Query LlamaIndex or other AI service
        result = self.ai_repo.generate_summary(prompt)
        
        # Return the food suggestion (ensure it's a string)
        return result.strip() if result else None

        
        
        
        
        