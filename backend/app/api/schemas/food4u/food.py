from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Diet Type Pydantic Model
class DietTypeCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = Field(..., max_length=255)

    class Config:
        from_attributes = True


# Meal Type Pydantic Model
class MealTypeCreate(BaseModel):
    MealTypeName: str = Field(..., max_length=50)

    class Config:
        from_attributes = True
