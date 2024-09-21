from fastapi import APIRouter, HTTPException, Depends, Query, Response
from typing import Optional, Union, List, Tuple

from pydantic import StrictStr, StrictInt, StrictFloat, StrictBool, Field
from app.api.services.spoonacular.spoon_service import Spoon_Service
from app.api.dependencies.spoon_dep import get_spoon_service
from app.api.schemas.spoonacular.autocomplete_product_search200_response import AutocompleteProductSearch200Response
from app.api.schemas.spoonacular.classify_grocery_product200_response import ClassifyGroceryProduct200Response
from app.api.schemas.spoonacular.classify_grocery_product_bulk200_response_inner import ClassifyGroceryProductBulk200ResponseInner
from app.api.schemas.spoonacular.get_comparable_products200_response import GetComparableProducts200Response
from app.api.schemas.spoonacular.product_information import ProductInformation
from app.api.schemas.spoonacular.search_grocery_products200_response import SearchGroceryProducts200Response
from app.api.schemas.spoonacular.search_grocery_products_by_upc200_response import SearchGroceryProductsByUPC200Response
from app.api.schemas.spoonacular.classify_grocery_product_bulk_request_inner import ClassifyGroceryProductBulkRequestInner
from app.api.schemas.spoonacular.classify_grocery_product_request import ClassifyGroceryProductRequest

router = APIRouter()


# Classify Grocery Product
@router.post("/classify", response_model=ClassifyGroceryProduct200Response)
async def classify_grocery_product(
    classify_grocery_product_request: ClassifyGroceryProductRequest,
    locale: Optional[StrictStr] = None,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.classify_grocery_product(
            classify_grocery_product_request=classify_grocery_product_request, 
            locale=locale
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Autocomplete Product Search
@router.get("/autocomplete", response_model=AutocompleteProductSearch200Response)
async def autocomplete_product_search(
    query: StrictStr,
    number: Optional[int] = Query(None, ge=1, le=25),  # Use Query instead of Field
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.autocomplete_product_search(query=query, number=number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Classify Grocery Product Bulk
@router.post("/classify-bulk", response_model=List[ClassifyGroceryProductBulk200ResponseInner])
async def classify_grocery_product_bulk(
    classify_grocery_product_bulk_request: List[ClassifyGroceryProductBulkRequestInner],
    locale: Optional[StrictStr] = Query(None),  # Use Query instead of Field
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.classify_grocery_product_bulk(
            classify_grocery_product_bulk_request=classify_grocery_product_bulk_request, 
            locale=locale
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Comparable Products
@router.get("/comparable", response_model=GetComparableProducts200Response)
async def get_comparable_products(
    upc: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_comparable_products(upc=upc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Product Information by ID
@router.get("/{id}", response_model=ProductInformation)
async def get_product_information(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_product_information(id=id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@router.get("/autocomplete", response_model=AutocompleteProductSearch200Response)
async def autocomplete_product_search(
    query: StrictStr,
    number: Optional[int] = Query(None, ge=1, le=25),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.autocomplete_product_search(query=query, number=number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Classify Grocery Product
@router.post("/classify", response_model=ClassifyGroceryProduct200Response)
async def classify_grocery_product(
    classify_grocery_product_request: ClassifyGroceryProductRequest,
    locale: Optional[StrictStr] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.classify_grocery_product(classify_grocery_product_request=classify_grocery_product_request, locale=locale)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Classify Grocery Product Bulk
@router.post("/classify-bulk", response_model=List[ClassifyGroceryProductBulk200ResponseInner])
async def classify_grocery_product_bulk(
    classify_grocery_product_bulk_request: List[ClassifyGroceryProductBulkRequestInner],
    locale: Optional[StrictStr] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.classify_grocery_product_bulk(classify_grocery_product_bulk_request=classify_grocery_product_bulk_request, locale=locale)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Get Product Information by ID
@router.get("/{id}", response_model=ProductInformation)
async def get_product_information(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.get_product_information(id=id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Product Nutrition by ID as Image
@router.get("/nutrition-image/{id}")
async def product_nutrition_by_id_image(
    id: StrictInt,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        image_data = await service.product_nutrition_by_id_image(id=id)
        return Response(content=image_data, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Product Nutrition Label as Image
@router.get("/nutrition-label-image/{id}")
async def product_nutrition_label_image(
    id: StrictInt,
    show_optional_nutrients: Optional[StrictBool] = Query(None),
    show_zero_values: Optional[StrictBool] = Query(None),
    show_ingredients: Optional[StrictBool] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        image_data = await service.product_nutrition_label_image(
            id=id,
            show_optional_nutrients=show_optional_nutrients,
            show_zero_values=show_zero_values,
            show_ingredients=show_ingredients
        )
        return Response(content=image_data, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get Product Nutrition Label Widget
@router.get("/nutrition-label-widget/{id}", response_model=str)
async def product_nutrition_label_widget(
    id: StrictInt,
    default_css: Optional[StrictBool] = Query(None),
    show_optional_nutrients: Optional[StrictBool] = Query(None),
    show_zero_values: Optional[StrictBool] = Query(None),
    show_ingredients: Optional[StrictBool] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.product_nutrition_label_widget(
            id=id,
            default_css=default_css,
            show_optional_nutrients=show_optional_nutrients,
            show_zero_values=show_zero_values,
            show_ingredients=show_ingredients
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Search Grocery Products
@router.get("/search", response_model=SearchGroceryProducts200Response)
async def search_grocery_products(
    query: StrictStr,
    min_calories: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_calories: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    min_carbs: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_carbs: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    min_protein: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_protein: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    min_fat: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    max_fat: Optional[Union[StrictFloat, StrictInt]] = Query(None),
    add_product_information: Optional[StrictBool] = Query(None),
    offset: Optional[int] = Query(None, ge=0, le=900),
    number: Optional[int] = Query(10, ge=1, le=100),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.search_grocery_products(
            query=query,
            min_calories=min_calories,
            max_calories=max_calories,
            min_carbs=min_carbs,
            max_carbs=max_carbs,
            min_protein=min_protein,
            max_protein=max_protein,
            min_fat=min_fat,
            max_fat=max_fat,
            add_product_information=add_product_information,
            offset=offset,
            number=number
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Search Grocery Products by UPC
@router.get("/search-upc/{upc}", response_model=SearchGroceryProductsByUPC200Response)
async def search_grocery_products_by_upc(
    upc: StrictStr,
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.search_grocery_products_by_upc(upc=upc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Visualize Product Nutrition by ID as HTML
@router.get("/nutrition-widget/{id}", response_model=str)
async def visualize_product_nutrition_by_id(
    id: StrictInt,
    default_css: Optional[StrictBool] = Query(None),
    service: Spoon_Service = Depends(get_spoon_service)
):
    try:
        return await service.visualize_product_nutrition_by_id(id=id, default_css=default_css)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))