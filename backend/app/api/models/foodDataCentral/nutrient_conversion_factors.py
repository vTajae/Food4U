from pydantic import BaseModel
from typing import Optional


class NutrientConversionFactors(BaseModel):
    type: Optional[str] = None
    value: Optional[float] = None

    class Config:
        from_attributes = True
