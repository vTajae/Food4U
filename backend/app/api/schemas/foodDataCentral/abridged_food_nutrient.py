from pydantic import BaseModel, Field
from typing import Optional

# Food Nutrients Model
class AbridgedFoodNutrient(BaseModel):
    number: Optional[int] = None
    name: Optional[str] = None
    amount: Optional[float] = None
    unit_name: Optional[str] = Field(None, alias="unitName")
    derivation_code: Optional[str] = Field(None, alias="derivationCode")
    derivation_description: Optional[str] = Field(None, alias="derivationDescription")

    class Config:
        from_attributes = True