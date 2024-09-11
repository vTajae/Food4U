from pydantic import BaseModel
from typing import Optional, List


class FoodsCriteria(BaseModel):
    fdc_ids: Optional[List[int]] = None
    format: Optional[str] = "full"
    nutrients: Optional[List[int]] = None

    class Config:
        orm_mode = True
