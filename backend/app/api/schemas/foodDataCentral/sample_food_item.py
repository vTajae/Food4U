from pydantic import BaseModel
from typing import Optional, List
from FoodCentralAPI.models.food_category import FoodCategory


class SampleFoodItem(BaseModel):
    fdc_id: Optional[int] = None
    datatype: Optional[str] = None
    description: Optional[str] = None
    food_class: Optional[str] = None
    publication_date: Optional[str] = None
    food_attributes: Optional[List[FoodCategory]] = None

    class Config:
        from_attributes = True
