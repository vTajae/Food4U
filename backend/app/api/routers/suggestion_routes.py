from profile import Profile
from typing import List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Query, logger, status
import random
from fastapi import HTTPException, status
from app.api.services.food4u.suggestion_service import SuggestionService
from app.api.dependencies.auth_dep import get_current_user
from app.api.dependencies.fdc_dep import get_fdc_service
from app.api.dependencies.food4u_dep import get_profile_service, get_suggestion_service
from app.api.services.fdc.fdc_service import FDC_Service
from app.api.schemas.food4u.suggestion import BasicAPIResponse, Query4Food, SuggestionRequest
from app.api.dependencies.spoon_dep import get_spoon_service
from app.api.services.spoonacular.spoon_service import Spoon_Service
from app.api.services.food4u.profile_service import ProfileService
from app.api.schemas.foodDataCentral.search_result_food import SearchResultFood


router = APIRouter()


@router.post("/api/suggestion", response_model=BasicAPIResponse)
async def get_general_suggestion(
    data: Query4Food,
    user: Profile = Depends(get_current_user),
    profile_service: ProfileService = Depends(get_profile_service),
    fdc_service: FDC_Service = Depends(get_fdc_service),
    spoon_service: Spoon_Service = Depends(get_spoon_service),
    suggestion_service: SuggestionService = Depends(get_suggestion_service)
) -> BasicAPIResponse:
    """
    Fetch a food suggestion and return a randomized food item from the results.
    """
    try:
        # Get profile information
        user_data = await profile_service.get_all_profile_info(user.id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        # Generate food suggestion message
        food_idea = await suggestion_service.get_general_message2(user_data)
        if not food_idea:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate a food suggestion"
            )

        # Retry logic in case no food items are found
        max_retries = 3
        retry_count = 0
        response = None

        while retry_count < max_retries:
            # Randomize page_size and page_number
            # Random page size between 10 and 200
            page_size = random.randint(10, 200)
            # Assume there are up to 10 pages (this could be dynamic)
            total_pages = 10
            page_number = random.randint(1, total_pages)

            # Call the service to search for foods
            response = await fdc_service.search_foods(
                query=food_idea,
                data_type=["Branded"],
                page_size=page_size,
                page_number=page_number,
                sort_by="dataType.keyword"
            )

            if response and response.foods:
                break  # Exit the loop if food items are found
            retry_count += 1
            logger.warning(
                f"Retry {retry_count}: No food items found, retrying with different page and size.")

        if not response or not response.foods:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No food items found after multiple attempts."
            )

        # Ensure that we have enough items to select from
        # Ensure we don't try to select more than available
        num_foods = min(len(response.foods), 3)

        # Randomly select food items from the available food results
        random_indices = random.sample(range(len(response.foods)), num_foods)
        result = [response.foods[i] for i in random_indices]

        return BasicAPIResponse(
            status=True,
            message=f"Food suggestion retrieved successfully from page {page_number}, size {page_size}.",
            result=result
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.exception(f"An error occurred: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while processing your request"
        )
