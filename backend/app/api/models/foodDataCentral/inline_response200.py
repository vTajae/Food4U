from typing import Optional, List
from pydantic import BaseModel

from app.api.models.foodDataCentral.food_nutrient import FoodNutrient

# Define label nutrients model (e.g., fat, carbohydrates, etc.)
class LabelNutrientItem(BaseModel):
    value: Optional[float] = None  # Optional with a default of None

class LabelNutrients(BaseModel):
    fat: Optional[LabelNutrientItem] = None
    saturatedFat: Optional[LabelNutrientItem] = None
    transFat: Optional[LabelNutrientItem] = None
    cholesterol: Optional[LabelNutrientItem] = None
    sodium: Optional[LabelNutrientItem] = None
    carbohydrates: Optional[LabelNutrientItem] = None
    fiber: Optional[LabelNutrientItem] = None
    sugars: Optional[LabelNutrientItem] = None
    protein: Optional[LabelNutrientItem] = None
    calcium: Optional[LabelNutrientItem] = None
    iron: Optional[LabelNutrientItem] = None
    potassium: Optional[LabelNutrientItem] = None
    calories: Optional[LabelNutrientItem] = None

# Define main response model
class InlineResponse200(BaseModel):
    fdcId: int
    description: str
    publicationDate: str
    foodNutrients: Optional[List[FoodNutrient]] = None  # Optional with default None
    labelNutrients: Optional[LabelNutrients] = None  # Optional with default None
    brandOwner: Optional[str] = None  # Optional with default None
    ingredients: Optional[str] = None  # Optional with default None
    servingSize: Optional[float] = None  # Optional with default None
    servingSizeUnit: Optional[str] = None  # Optional with default None

    class Config:
        from_attributes = True
