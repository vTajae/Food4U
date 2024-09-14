from pydantic import BaseModel, Field
from typing import Optional, List


class FoodsCriteria(BaseModel):
    fdc_ids: List[int] = Field(alias="fdcIds")
    format: Optional[str] = "full"
    nutrients: Optional[List[int]] = None

    class Config:
        from_attributes = True
