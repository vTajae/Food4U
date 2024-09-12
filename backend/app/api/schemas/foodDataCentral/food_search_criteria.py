from pydantic import BaseModel, conlist
from typing import Optional, List


class FoodSearchCriteria(BaseModel):
    query: Optional[str] = None
    data_type: Optional[List[str]] = None
    page_size: Optional[int] = 50
    page_number: Optional[int] = 1
    sort_by: Optional[str] = None
    sort_order: Optional[str] = None
    brand_owner: Optional[str] = None
    trade_channel: Optional[List[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    class Config:
        from_attributes = True
