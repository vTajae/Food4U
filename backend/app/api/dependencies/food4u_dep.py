from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies.user_dep import get_db_session
from app.api.repo.profile_repo import ProfileRepository
from app.api.services.food4u.profile_service import ProfileService
from app.api.repo.medical_repo import MedicalRepository
from app.api.repo.preference_repo import PreferenceRepository
from app.api.services.food4u.medical_service import MedicalService
from app.api.services.food4u.preferences_service import PreferenceService
from app.api.repo.goal_repo import GoalRepository
from app.api.services.food4u.goal_service import GoalService


# Dependency for UserService with ProfileRepository and AuthRepository
def get_profile_service(db: AsyncSession = Depends(get_db_session)) -> ProfileService:
    user_repo = ProfileRepository(db)
    return ProfileService(user_repo)


# Dependency for UserService with ProfileRepository and AuthRepository
def get_medical_service(db: AsyncSession = Depends(get_db_session)) -> MedicalService:
    user_repo = MedicalRepository(db)
    return MedicalService(user_repo)


# Dependency for UserService with ProfileRepository and AuthRepository
def get_preference_service(db: AsyncSession = Depends(get_db_session)) -> PreferenceService:
    user_repo = PreferenceRepository(db)
    return PreferenceService(user_repo)


# Dependency for UserService with ProfileRepository and AuthRepository
def get_goals_service(db: AsyncSession = Depends(get_db_session)) -> GoalService:
    user_repo = GoalRepository(db)
    return GoalService(user_repo)
