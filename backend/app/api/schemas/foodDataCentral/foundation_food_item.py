from pydantic import BaseModel
from typing import Optional, List
from FoodCentralAPI.models.food_category import FoodCategory
from FoodCentralAPI.models.food_component import FoodComponent
from FoodCentralAPI.models.food_nutrient import FoodNutrient
from FoodCentralAPI.models.food_portion import FoodPortion
from FoodCentralAPI.models.input_food_foundation import InputFoodFoundation
from FoodCentralAPI.models.nutrient_conversion_factors import NutrientConversionFactors


class FoundationFoodItem(BaseModel):
    fdc_id: Optional[int] = None
    data_type: Optional[str] = None
    description: Optional[str] = None
    food_class: Optional[str] = None
    foot_note: Optional[str] = None
    is_historical_reference: Optional[bool] = None
    ndb_number: Optional[int] = None
    publication_date: Optional[str] = None
    scientific_name: Optional[str] = None
    food_category: Optional[FoodCategory] = None
    food_components: Optional[List[FoodComponent]] = None
    food_nutrients: Optional[List[FoodNutrient]] = None
    food_portions: Optional[List[FoodPortion]] = None
    input_foods: Optional[List[InputFoodFoundation]] = None
    nutrient_conversion_factors: Optional[List[NutrientConversionFactors]] = None

    class Config:
        orm_mode = True
