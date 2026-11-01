from pydantic import BaseModel
from typing import Optional

class FoodComponent(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    data_points: Optional[int] = None
    gram_weight: Optional[float] = None
    is_refuse: Optional[bool] = None
    min_year_acquired: Optional[int] = None
    percent_weight: Optional[float] = None

    class Config:
        from_attributes = True
