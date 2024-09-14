from fastapi import APIRouter, Body, Depends, HTTPException
from typing import List, Optional

from pydantic import BaseModel

from app.api.services.spoon_service import Spoon_Service
from app.api.dependencies.spoon_dep import get_spoon_service



router = APIRouter()


class AnalyzeRecipeRequest(BaseModel):
    title: str
    ingredients: List[str]
    servings: Optional[int] = None
    
    
# Route to generate a recipe card
@router.get("/recipes/{recipe_id}/card")
async def create_recipe_card(
    recipe_id: int,
    mask: Optional[str] = None,
    background_image: Optional[str] = None,
    background_color: Optional[str] = None,
    font_color: Optional[str] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.create_recipe_card(
            recipe_id, mask=mask, background_image=background_image,
            background_color=background_color, font_color=font_color
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Route to analyze a recipe
@router.post("/recipes/analyze")
async def analyze_recipe(
    analyze_recipe_request: AnalyzeRecipeRequest = Body(...),  # Use Body to grab the JSON payload
    language: Optional[str] = "en",
    include_nutrition: Optional[bool] = False,
    include_taste: Optional[bool] = False,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.analyze_recipe(
            analyze_recipe_request.model_dump(),
            language=language,
            include_nutrition=include_nutrition,
            include_taste=include_taste
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






# Route to search restaurants
@router.get("/food/restaurants/search")
async def search_restaurants(
    query: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    distance: Optional[float] = None,
    budget: Optional[float] = None,
    cuisine: Optional[str] = None,
    min_rating: Optional[float] = None,
    is_open: Optional[bool] = None,
    sort: Optional[str] = None,
    page: Optional[int] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.search_restaurants(
            query=query, lat=lat, lng=lng, distance=distance, budget=budget,
            cuisine=cuisine, min_rating=min_rating, is_open=is_open, sort=sort, page=page
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
