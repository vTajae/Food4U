from pydantic import BaseModel
from typing import Optional
from FoodCentralAPI.models.food_nutrient_derivation import FoodNutrientDerivation
from FoodCentralAPI.models.nutrient import Nutrient
from FoodCentralAPI.models.nutrient_analysis_details import NutrientAnalysisDetails


class FoodNutrient(BaseModel):
    id: Optional[int] = None
    amount: Optional[float] = None
    data_points: Optional[int] = None
    min: Optional[float] = None
    max: Optional[float] = None
    median: Optional[float] = None
    type: Optional[str] = None
    nutrient: Optional[Nutrient] = None
    food_nutrient_derivation: Optional[FoodNutrientDerivation] = None
    nutrient_analysis_details: Optional[NutrientAnalysisDetails] = None

    class Config:
        orm_mode = True
