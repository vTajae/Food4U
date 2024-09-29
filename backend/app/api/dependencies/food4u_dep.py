from fastapi import Depends
from app.config.database import async_database_session
from app.api.repo.profile_repo import ProfileRepository
from app.api.services.food4u.profile_service import ProfileService
from app.api.repo.medical_repo import MedicalRepository
from app.api.repo.preference_repo import PreferenceRepository
from app.api.services.food4u.medical_service import MedicalService
from app.api.services.food4u.preferences_service import PreferenceService
from app.api.repo.goal_repo import GoalRepository
from app.api.services.food4u.goal_service import GoalService
from app.api.services.food4u.suggestion_service import SuggestionService


# Dependency for UserService with ProfileRepository and AuthRepository
async def get_profile_service() -> ProfileService:
    async with async_database_session.get_session() as db:
        user_repo = ProfileRepository(db)
        return ProfileService(user_repo)


# Dependency for UserService with ProfileRepository and AuthRepository
async def get_medical_service() -> MedicalService:
    async with async_database_session.get_session() as db:
        user_repo = MedicalRepository(db)
        return MedicalService(user_repo)


# Dependency for UserService with ProfileRepository and AuthRepository
async def get_preference_service() -> PreferenceService:
    async with async_database_session.get_session() as db:
        user_repo = PreferenceRepository(db)
        return PreferenceService(user_repo)


# Dependency for UserService with ProfileRepository and AuthRepository
async def get_goals_service() -> GoalService:
    async with async_database_session.get_session() as db:
        user_repo = GoalRepository(db)
        return GoalService(user_repo)


# Dependency for UserService with ProfileRepository and AuthRepository
async def get_suggestion_service() -> SuggestionService:
    async with async_database_session.get_session() as db:
        profile_repo = ProfileRepository(db)
        return SuggestionService(profile_repo)
