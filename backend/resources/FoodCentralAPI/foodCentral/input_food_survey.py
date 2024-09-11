from pydantic import BaseModel
from typing import Optional
from FoodCentralAPI.models.survey_food_item import SurveyFoodItem
from FoodCentralAPI.models.retention_factor import RetentionFactor


class InputFoodSurvey(BaseModel):
    id: Optional[int] = None
    amount: Optional[float] = None
    food_description: Optional[str] = None
    ingredient_code: Optional[int] = None
    ingredient_description: Optional[str] = None
    ingredient_weight: Optional[float] = None
    portion_code: Optional[str] = None
    portion_description: Optional[str] = None
    sequence_number: Optional[int] = None
    survey_flag: Optional[int] = None
    unit: Optional[str] = None
    input_food: Optional[SurveyFoodItem] = None
    retention_factor: Optional[RetentionFactor] = None

    class Config:
        orm_mode = True
