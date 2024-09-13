from pydantic import BaseModel
from typing import Optional

from backend.app.api.schemas.foodDataCentral.sample_food_item import SampleFoodItem


class InputFoodFoundation(BaseModel):
    id: Optional[int] = None
    food_description: Optional[str] = None
    input_food: Optional[SampleFoodItem] = None

    class Config:
        from_attributes = True
