from typing import List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Query

from app.api.services.food4u.suggestion_service import SuggestionService
from backend.app.api.dependencies.fdc_dep import get_fdc_service
from backend.app.api.dependencies.food4u_dep import get_suggestion_service
from backend.app.api.services.fdc.fdc_service import FDC_Service


router = APIRouter()


@router.post("/api/suggestion")
async def get_general_suggestion(
    queryKey: str,
    # text: Optional[str] = Query(default="full"),
    fdc_service: FDC_Service = Depends(get_fdc_service),
    suggestion_service: SuggestionService = Depends(get_suggestion_service)
):
    """
    Fetch a single food item by FDC ID.
    """
    return await suggestion_service.get_general_suggestion(queryKey)
