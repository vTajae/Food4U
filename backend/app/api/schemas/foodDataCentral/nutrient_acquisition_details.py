from pydantic import BaseModel
from typing import Optional


class NutrientAcquisitionDetails(BaseModel):
    sample_unit_id: Optional[int] = None
    purchase_date: Optional[str] = None
    store_city: Optional[str] = None
    store_state: Optional[str] = None

    class Config:
        from_attributes = True
