from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# Profile Vitals Pydantic Model
class ProfileVitalsCreate(BaseModel):
    Height: float
    Weight: float
    BloodPressure: Optional[str] = None
    BMI: Optional[float] = None
    BloodOxygen: Optional[float] = None
    CaloriesTarget: Optional[int] = None
    WeightGoal: Optional[float] = None
    CaloriesConsumed: Optional[int] = None
    GoalStartDate: Optional[datetime] = None
    GoalEndDate: Optional[datetime] = None

    class Config:
        from_attributes = True


# ICD Codes Pydantic Model
class ICDCodesCreate(BaseModel):
    code: str = Field(..., max_length=10)
    name: Optional[str] = Field(..., max_length=255)

    class Config:
        from_attributes = True


# Profile Attribute Pydantic Model
class ProfileAttributeCreate(BaseModel):
    ProfileID: int
    AttributeCategory: str = Field(..., max_length=50)
    AttributeName: str = Field(..., max_length=100)
    AttributeValue: Optional[str] = Field(None, max_length=255)
    Notes: Optional[str] = None

    class Config:
        from_attributes = True


# Allergen Pydantic Model
class AllergenCreate(BaseModel):
    AllergenName: str = Field(..., max_length=255)
    CommonName: Optional[str] = Field(None, max_length=255)
    Allergenicity: Optional[str] = Field(None, max_length=50)
    Source: Optional[str] = Field(None, max_length=255)
    ProteinSequence: Optional[str] = None
    AccessionNumber: Optional[str] = Field(None, max_length=50)
    Species: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True


# Intolerance Pydantic Model
class IntoleranceCreate(BaseModel):
    IntoleranceName: str = Field(..., max_length=100)
    Description: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True

class DietTypeCreate(BaseModel):
    name: str = Field(..., example="Vegan", description="The name of the diet type")
    description: Optional[str] = Field(None, example="A plant-based diet excluding animal products", description="Description of the diet")
    
    class Config:
        from_attributes = True


class DietTypeResponse(BaseModel):
    id: int
    diet_name: str
    description: Optional[str]

    class Config:
        from_attributes = True


class DietTypeUpdate(BaseModel):
    diet_type_id: int
    diet_name: Optional[str] = None

class IntoleranceCreate(BaseModel):
    intolerance_name: str
    description: Optional[str] = None

class IntoleranceUpdate(BaseModel):
    intolerance_name: Optional[str] = None
    description: Optional[str] = None

class AllergenCreate(BaseModel):
    allergen_name: str
    description: Optional[str] = None

class AllergenUpdate(BaseModel):
    allergen_name: Optional[str] = None
    description: Optional[str] = None
