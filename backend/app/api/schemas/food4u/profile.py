from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Profile Pydantic Model


class ProfileCreate(BaseModel):
    ProfileID: int
    Age: Optional[int] = None
    Ethnicity: Optional[str] = None
    Location: Optional[str] = None

    class Config:
        from_attributes = True


# # Profile Attribute Pydantic Model
# class ProfileAttributeCreate(BaseModel):
#     ProfileID: int
#     AttributeCategory: str = Field(..., max_length=50)
#     AttributeName: str = Field(..., max_length=100)
#     AttributeValue: Optional[str] = Field(None, max_length=255)
#     Notes: Optional[str] = None

#     class Config:
#         from_attributes = True

# Schema for ProfileAttribute


class ProfileAttributeSchema(BaseModel):
    id: int
    attribute_category: str
    attribute_name: str
    attribute_value: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Schema for DietType
class DietTypeSchema(BaseModel):
    diet_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# Schema for ProfileDiet
class ProfileDietSchema(BaseModel):
    diet_type: DietTypeSchema

    class Config:
        from_attributes = True


# Main Profile Schema
class ProfileSchema(BaseModel):
    id: int
    age: Optional[int]
    ethnicity: Optional[str]
    location: Optional[str]
    created_at: datetime
    updated_at: datetime
    attributes: List[ProfileAttributeSchema]
    diets: List[ProfileDietSchema]
    # Add other relationships (e.g., medical_history) similarly if needed

    class Config:
        from_attributes = True
