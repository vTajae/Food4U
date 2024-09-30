from typing import List
from app.api.repo.medical_repo import MedicalRepository
from app.api.schemas.food4u.welcome import Suggestion
from app.api.schemas.food4u.medical import AllergenCreate, AllergenUpdate, IntoleranceCreate, IntoleranceUpdate

class MedicalService:
    def __init__(self, repo: MedicalRepository):
        self.repo = repo

    async def post_medical(self, profile_id: str, query_key: str, suggestions: List[Suggestion]):
        for suggestion in suggestions:
            # Handle 'icd10cm' query key
            if query_key == "icd10cm":
                await self.repo.add_icd_code(icd_data=suggestion)
                await self.repo.LinkMedicalCodeToUser(profile_id, suggestion.code)
            # Handle 'conditions' query key
            elif query_key == "conditions":
                await self.repo.add_icd_code(icd_data=suggestion)
                await self.repo.LinkMedicalCodeToUser(profile_id, suggestion.code)


#INTOLERANCE
    async def create_intolerance(self, intolerance_data: IntoleranceCreate):
        return await self.repo.create_intolerance(intolerance_data)

    async def update_intolerance(self, intolerance_id: int, intolerance_data: IntoleranceUpdate):
        return await self.repo.update_intolerance(intolerance_id, intolerance_data)

    async def delete_intolerance(self, intolerance_id: int):
        await self.repo.delete_intolerance(intolerance_id)

    async def bulk_update_intolerances(self, intolerances: List[IntoleranceUpdate]):
        await self.repo.bulk_update_intolerances(intolerances)

    async def get_all_intolerances(self):
        return await self.repo.get_all_intolerances()
    
    
    #ALLERGEN
    
    async def create_allergen(self, allergen_data: AllergenCreate):
        return await self.repo.create_allergen(allergen_data)

    async def update_allergen(self, allergen_id: int, allergen_data: AllergenUpdate):
        return await self.repo.update_allergen(allergen_id, allergen_data)

    async def delete_allergen(self, allergen_id: int):
        await self.repo.delete_allergen(allergen_id)

    async def bulk_update_allergens(self, allergens: List[AllergenUpdate]):
        await self.repo.bulk_update_allergens(allergens)

    async def get_all_allergens(self):
        return await self.repo.get_all_allergens()
    
    