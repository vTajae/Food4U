from pydantic import BaseModel
from typing import Optional, List
from FoodCentralAPI.models.food_attribute import FoodAttribute
from FoodCentralAPI.models.food_portion import FoodPortion
from FoodCentralAPI.models.input_food_survey import InputFoodSurvey
from FoodCentralAPI.models.wweia_food_category import WweiaFoodCategory


class SurveyFoodItem(BaseModel):
    fdc_id: Optional[int] = None
    datatype: Optional[str] = None
    description: Optional[str] = None
    end_date: Optional[str] = None
    food_class: Optional[str] = None
    food_code: Optional[str] = None
    publication_date: Optional[str] = None
    start_date: Optional[str] = None
    food_attributes: Optional[List[FoodAttribute]] = None
    food_portions: Optional[List[FoodPortion]] = None
    input_foods: Optional[List[InputFoodSurvey]] = None
    wweia_food_category: Optional[WweiaFoodCategory] = None

    class Config:
        from_attributes = True
