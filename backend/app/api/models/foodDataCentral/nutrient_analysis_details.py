from pydantic import BaseModel
from typing import Optional, List

from app.api.models.foodDataCentral.nutrient_acquisition_details import NutrientAcquisitionDetails


class NutrientAnalysisDetails(BaseModel):
    sub_sample_id: Optional[int] = None
    amount: Optional[float] = None
    nutrient_id: Optional[int] = None
    lab_method_description: Optional[str] = None
    lab_method_original_description: Optional[str] = None
    lab_method_link: Optional[str] = None
    lab_method_technique: Optional[str] = None
    nutrient_acquisition_details: Optional[List[NutrientAcquisitionDetails]] = None

    class Config:
        from_attributes = True
