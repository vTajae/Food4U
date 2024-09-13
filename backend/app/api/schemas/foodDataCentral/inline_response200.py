from pydantic import BaseModel
from typing import List, Optional, Dict


# Define nutrient model
class Nutrient(BaseModel):
    id: int
    number: str
    name: str
    rank: int
    unitName: str


class FoodNutrientDerivation(BaseModel):
    id: int
    code: str
    description: str


class FoodNutrient(BaseModel):
    type: str
    id: int
    amount: Optional[float]
    nutrient: Nutrient
    foodNutrientDerivation: FoodNutrientDerivation


# Define label nutrients model (e.g., fat, carbohydrates, etc.)
class LabelNutrientItem(BaseModel):
    value: Optional[float]


class LabelNutrients(BaseModel):
    fat: Optional[LabelNutrientItem]
    saturatedFat: Optional[LabelNutrientItem]
    transFat: Optional[LabelNutrientItem]
    cholesterol: Optional[LabelNutrientItem]
    sodium: Optional[LabelNutrientItem]
    carbohydrates: Optional[LabelNutrientItem]
    fiber: Optional[LabelNutrientItem]
    sugars: Optional[LabelNutrientItem]
    protein: Optional[LabelNutrientItem]
    calcium: Optional[LabelNutrientItem]
    iron: Optional[LabelNutrientItem]
    potassium: Optional[LabelNutrientItem]
    calories: Optional[LabelNutrientItem]


# Define main response model
class InlineResponse200(BaseModel):
    fdcId: int
    description: str
    publicationDate: str
    foodNutrients: List[FoodNutrient]
    labelNutrients: Optional[LabelNutrients]  # Some foods might not have label nutrients
    brandOwner: Optional[str]
    ingredients: Optional[str]
    servingSize: Optional[float]
    servingSizeUnit: Optional[str]

    class Config:
        from_attributes = True
