from profile import Profile
from typing import List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Query

from app.api.services.food4u.suggestion_service import SuggestionService
from app.api.dependencies.auth_dep import get_current_user
from app.api.dependencies.fdc_dep import get_fdc_service
from app.api.dependencies.food4u_dep import get_profile_service, get_suggestion_service
from app.api.services.fdc.fdc_service import FDC_Service
from app.api.schemas.food4u.suggestion import SuggestionRequest
from app.api.dependencies.spoon_dep import get_spoon_service
from app.api.services.spoonacular.spoon_service import Spoon_Service
from app.api.services.food4u.profile_service import ProfileService


router = APIRouter()

# @router.post("/api/suggestion")
# async def get_general_suggestion(
#     # request: SuggestionRequest,  # Unified input schema
#     user: Profile = Depends(get_current_user), 
#     fdc_service: FDC_Service = Depends(get_fdc_service),
#     suggestion_service: SuggestionService = Depends(get_suggestion_service),
#     profile_service: ProfileService = Depends(get_profile_service)

# ):
    
    
#     # data = await profile_service.get_all_profile_info(user.id)
    
#     # print(data, "data")

#     """
#     Fetch food items and then pass them into the suggestion service.
#     """
#     # Extract the food query parameters from the request
#     # food_query = request.food_query
    
#     # # Fetch the food list using the food query parameters
#     # food_list = await fdc_service.get_foods_list(
#     #     dataType=food_query.data_type,
#     #     pageSize=food_query.page_size,
#     #     pageNumber=food_query.page_number,
#     #     sortBy=food_query.sort_by,
#     #     sortOrder=food_query.sort_order
#     # )
    
#     # # Now pass the food list and suggestion query into the suggestion service
#     # suggestion_data = {
#     #     "foods": food_list,
#     #     "user_preferences": data.attributes,
#     #     "dietary_restrictions": data.diets
#     # }
    
#     # Call the suggestion service with the combined data
#     # return await suggestion_service.get_general_suggestion(suggestion_data)
    
#     return await suggestion_service.get_general_suggestion("hi")



@router.post("/api/suggestion")
async def get_general_suggestion(
    data: SuggestionRequest,
    user: Profile = Depends(get_current_user),

    # text: Optional[str] = Query(default="full"),
    fdc_service: FDC_Service = Depends(get_fdc_service),
    spoon_service: Spoon_Service = Depends(get_spoon_service),

    suggestion_service: SuggestionService = Depends(get_suggestion_service)
):
    """
    Fetch a single food item by FDC ID.
    """
    data.query = "hi"
    return await suggestion_service.get_general_suggestion(data)
    

