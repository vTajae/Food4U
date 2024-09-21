from pydantic import BaseModel
from typing import Optional, List
from FoodCentralAPI.models.food_attribute import FoodAttribute


class FoodUpdateLog(BaseModel):
    fdc_id: Optional[int] = None
    available_date: Optional[str] = None
    brand_owner: Optional[str] = None
    data_source: Optional[str] = None
    data_type: Optional[str] = None
    description: Optional[str] = None
    food_class: Optional[str] = None
    gtin_upc: Optional[str] = None
    household_serving_full_text: Optional[str] = None
    ingredients: Optional[str] = None
    modified_date: Optional[str] = None
    publication_date: Optional[str] = None
    serving_size: Optional[int] = None
    serving_size_unit: Optional[str] = None
    branded_food_category: Optional[str] = None
    changes: Optional[str] = None
    food_attributes: Optional[List[FoodAttribute]] = None

    class Config:
        from_attributes = True
