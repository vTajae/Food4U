from pydantic import BaseModel
from typing import Optional

from app.api.schemas.foodDataCentral.food_nutrient_source import FoodNutrientSource


class FoodNutrientDerivation(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    description: Optional[str] = None
    food_nutrient_source: Optional[FoodNutrientSource] = None

    class Config:
        from_attributes = True
