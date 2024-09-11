from pydantic import BaseModel
from typing import Optional

class FoodAttributeFoodAttributeType(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

    class Config:
        orm_mode = True  # Enable ORM mode for compatibility with ORMs like SQLAlchemy
