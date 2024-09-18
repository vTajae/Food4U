from pydantic import BaseModel, Field
from typing import List, Optional


class MedicalPost(BaseModel):

    medical_code: Optional[List[str]] = Field(
        None,
        alias="medicalCode",
        description="Optional. The sort direction for the results. Only applicable if sortBy is specified.",
    )

    description: Optional[int] = Field(
        None,
        alias="description",
        description="Description of the medical code. (icd10cm)",
    )
