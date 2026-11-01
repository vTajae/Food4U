from typing import List
from app.api.repo.goal_repo import GoalRepository
from app.api.schemas.food4u.welcome import Suggestion


class GoalService:
    def __init__(self, repo: GoalRepository):
        self.repo = repo

    async def post_goals(self, profile_id: str, suggestions: List[Suggestion]):
        # Add logic to process and save goals
        for suggestion in suggestions:
            # Assuming each suggestion represents a goal
            await self.repo.add_user_goal(profile_id, suggestion.name)
