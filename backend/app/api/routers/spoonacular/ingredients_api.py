from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import Field, StrictStr, StrictFloat, StrictInt, StrictBool
from typing import List, Optional, Union, Tuple, Dict

# Import Spoonacular models and services
from app.api.services.spoonacular.spoon_service import Spoon_Service
from app.api.dependencies.spoon_dep import get_spoon_service
from app.api.schemas.spoonacular.autocomplete_ingredient_search200_response_inner import AutocompleteIngredientSearch200ResponseInner
from app.api.schemas.spoonacular.compute_ingredient_amount200_response import ComputeIngredientAmount200Response
from app.api.schemas.spoonacular.get_ingredient_substitutes200_response import GetIngredientSubstitutes200Response, IngredientSubstitutesErrorResponse
from app.api.schemas.spoonacular.ingredient_information import IngredientInformation
from app.api.schemas.spoonacular.ingredient_search200_response import IngredientSearch200Response
from app.api.schemas.spoonacular.map_ingredients_to_grocery_products200_response_inner import MapIngredientsToGroceryProducts200ResponseInner
from app.api.schemas.spoonacular.map_ingredients_to_grocery_products_request import MapIngredientsToGroceryProductsRequest

router = APIRouter()


# Compute Ingredient Amount Route
@router.get("/compute-ingredient-amount", response_model=ComputeIngredientAmount200Response)
async def compute_ingredient_amount(
    id: StrictInt,
    nutrient: StrictStr,
    target: StrictInt,
    unit: Optional[StrictStr] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.compute_ingredient_amount(
            id=id, nutrient=nutrient, target=target, unit=unit
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Ingredient Information Route
@router.get("/ingredient-information/{id}", response_model=IngredientInformation)
async def get_ingredient_information(
    id: StrictInt,
    amount: Optional[Union[StrictFloat, StrictInt]] = None,
    unit: Optional[StrictStr] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_ingredient_information(id=id, amount=amount, unit=unit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# Autocomplete Ingredient Search Route
@router.get("/autocomplete-ingredient-search", response_model=List[AutocompleteIngredientSearch200ResponseInner])
async def autocomplete_ingredient_search(
    query: StrictStr,
    number: Optional[int] = Query(10, le=100, ge=1, description="Max number of items (1-100). Defaults to 10."),
    meta_information: Optional[StrictBool] = Query(None),
    intolerances: Optional[StrictStr] = Query(None),
    language: Optional[StrictStr] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.autocomplete_ingredient_search(
            query=query, number=number, meta_information=meta_information,
            intolerances=intolerances, language=language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in autocomplete_ingredient_search: {str(e)}")


# Compute Ingredient Amount Route
@router.get("/compute-ingredient-amount", response_model=ComputeIngredientAmount200Response)
async def compute_ingredient_amount(
    id: StrictInt,
    nutrient: StrictStr,
    target: StrictInt,
    unit: Optional[StrictStr] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.compute_ingredient_amount(id=id, nutrient=nutrient, target=target, unit=unit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in compute_ingredient_amount: {str(e)}")


# Get Ingredient Information Route
@router.get("/ingredient-information/{id}", response_model=IngredientInformation)
async def get_ingredient_information(
    id: StrictInt,
    amount: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    unit: Optional[StrictStr] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_ingredient_information(id=id, amount=amount, unit=unit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in get_ingredient_information: {str(e)}")


# Get Ingredient Substitutes by Name Route
@router.get("/ingredient-substitutes", response_model=GetIngredientSubstitutes200Response)
async def get_ingredient_substitutes(
    ingredient_name: str = Query(..., alias="ingredientName", description="Ingredient is required"),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_ingredient_substitutes(ingredient_name=ingredient_name)
        
        # Check if the response is an error
        if 'status' in result and result['status'] == 'failure':
            # Optionally, you can use the error response model to validate the error response
            error_response = IngredientSubstitutesErrorResponse(**result)
            raise HTTPException(
                status_code=404,
                detail=error_response.message
            )
        
        # Validate and return the success response
        success_response = GetIngredientSubstitutes200Response(**result)
        return success_response
    
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions to be handled by FastAPI
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in get_ingredient_substitutes: {str(e)}")

# Get Ingredient Substitutes by ID Route
@router.get("/ingredient-substitutes/{id}", response_model=GetIngredientSubstitutes200Response)
async def get_ingredient_substitutes_by_id(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.get_ingredient_substitutes_by_id(id=id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in get_ingredient_substitutes_by_id: {str(e)}")


# Ingredient Search Route
@router.get("/ingredient-search", response_model=IngredientSearch200Response)
async def ingredient_search(
    query: StrictStr,
    add_children: Optional[StrictBool] = Query(None),
    min_protein_percent: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_protein_percent: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    min_fat_percent: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_fat_percent: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    min_carbs_percent: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_carbs_percent: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    meta_information: Optional[StrictBool] = Query(None),
    intolerances: Optional[StrictStr] = Query(None),
    sort: Optional[StrictStr] = Query(None),
    sort_direction: Optional[StrictStr] = Query(None),
    offset: Optional[int] = Query(None, le=900, ge=0),
    number: Optional[int] = Query(10, le=100, ge=1),
    language: Optional[StrictStr] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.ingredient_search(
            query=query, add_children=add_children, min_protein_percent=min_protein_percent,
            max_protein_percent=max_protein_percent, min_fat_percent=min_fat_percent, max_fat_percent=max_fat_percent,
            min_carbs_percent=min_carbs_percent, max_carbs_percent=max_carbs_percent, meta_information=meta_information,
            intolerances=intolerances, sort=sort, sort_direction=sort_direction, offset=offset, number=number, language=language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in ingredient_search: {str(e)}")


# Map Ingredients to Grocery Products Route
@router.post("/map-ingredients-to-grocery-products", response_model=List[MapIngredientsToGroceryProducts200ResponseInner])
async def map_ingredients_to_grocery_products(
    map_ingredients_to_grocery_products_request: MapIngredientsToGroceryProductsRequest,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.map_ingredients_to_grocery_products(map_ingredients_to_grocery_products_request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in map_ingredients_to_grocery_products: {str(e)}")


# Visualize Ingredients Route
@router.post("/visualize-ingredients", response_model=str)
async def visualize_ingredients(
    ingredient_list: StrictStr,
    servings: Union[StrictFloat, StrictInt],
    language: Optional[StrictStr] = Query(None),
    measure: Optional[StrictStr] = Query(None),
    view: Optional[StrictStr] = Query(None),
    default_css: Optional[StrictBool] = Query(None),
    show_backlink: Optional[StrictBool] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        result = await service.visualize_ingredients(
            ingredient_list=ingredient_list, servings=servings, language=language, measure=measure,
            view=view, default_css=default_css, show_backlink=show_backlink
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in visualize_ingredients: {str(e)}")