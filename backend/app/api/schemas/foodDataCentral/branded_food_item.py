from pydantic import BaseModel
from typing import Optional

from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients import BrandedFoodItemLabelNutrientsTransFat
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_calcium import BrandedFoodItemLabelNutrientsCalcium
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_calories import BrandedFoodItemLabelNutrientsCalories
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_carbohydrates import BrandedFoodItemLabelNutrientsCarbohydrates
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_fat import BrandedFoodItemLabelNutrientsFat
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_fiber import BrandedFoodItemLabelNutrientsFiber
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_iron import BrandedFoodItemLabelNutrientsIron
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_potassium import BrandedFoodItemLabelNutrientsPotassium
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_protein import BrandedFoodItemLabelNutrientsProtein
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_saturated_fat import BrandedFoodItemLabelNutrientsSaturatedFat
from app.api.schemas.foodDataCentral.branded_food_item_label_nutrients_sugars import BrandedFoodItemLabelNutrientsSugars

class BrandedFoodItemLabelNutrients(BaseModel):
    fat: Optional['BrandedFoodItemLabelNutrientsFat'] = None
    saturated_fat: Optional['BrandedFoodItemLabelNutrientsSaturatedFat'] = None
    trans_fat: Optional['BrandedFoodItemLabelNutrientsTransFat'] = None
    cholesterol: Optional['BrandedFoodItemLabelNutrientsTransFat'] = None
    sodium: Optional['BrandedFoodItemLabelNutrientsTransFat'] = None
    carbohydrates: Optional['BrandedFoodItemLabelNutrientsCarbohydrates'] = None
    fiber: Optional['BrandedFoodItemLabelNutrientsFiber'] = None
    sugars: Optional['BrandedFoodItemLabelNutrientsSugars'] = None
    protein: Optional['BrandedFoodItemLabelNutrientsProtein'] = None
    calcium: Optional['BrandedFoodItemLabelNutrientsCalcium'] = None
    iron: Optional['BrandedFoodItemLabelNutrientsIron'] = None
    potassium: Optional['BrandedFoodItemLabelNutrientsPotassium'] = None
    calories: Optional['BrandedFoodItemLabelNutrientsCalories'] = None

    class Config:
        from_attributes = True  # For compatibility with ORMs if needed
