from pydantic import BaseModel
from typing import Optional

class AbridgedFoodNutrient(BaseModel):
    number: Optional[int] = None
    name: Optional[str] = None
    amount: Optional[float] = None
    unit_name: Optional[str] = None
    derivation_code: Optional[str] = None
    derivation_description: Optional[str] = None

    class Config:
        orm_mode = True  # If you're interacting with an ORM like SQLAlchemy
