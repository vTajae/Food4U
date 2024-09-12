from pydantic import BaseModel
from typing import Optional
from FoodCentralAPI.models.measure_unit import MeasureUnit


class FoodPortion(BaseModel):
    id: Optional[int] = None
    amount: Optional[float] = None
    data_points: Optional[int] = None
    gram_weight: Optional[float] = None
    min_year_acquired: Optional[int] = None
    modifier: Optional[str] = None
    portion_description: Optional[str] = None
    sequence_number: Optional[int] = None
    measure_unit: Optional[MeasureUnit] = None

    class Config:
        from_attributes = True
