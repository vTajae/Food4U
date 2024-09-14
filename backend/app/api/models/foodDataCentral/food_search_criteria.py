from pydantic import BaseModel, Field, conlist
from typing import Optional, List


class FoodSearchCriteria(BaseModel):
    query: Optional[str] = None
    data_type: Optional[List[str]] = Field(None, alias="dataType")
    page_size: Optional[int] = Field(50, alias="pageSize")
    page_number: Optional[int] = Field(1, alias="pageNumber")
    sort_by: Optional[str] = Field(None, alias="sortBy")
    sort_order: Optional[str] = Field(None, alias="sortOrder")
    brand_owner: Optional[str] = Field(None, alias="brandOwner")
    trade_channel: Optional[List[str]] = Field(None, alias="tradeChannel")
    start_date: Optional[str] = Field(None, alias="startDate")
    end_date: Optional[str] = Field(None, alias="endDate")

    class Config:
        from_attributes = True
