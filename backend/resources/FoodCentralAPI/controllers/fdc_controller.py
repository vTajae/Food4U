import connexion
import six

from FoodCentralAPI.models.abridged_food_item import AbridgedFoodItem  # noqa: E501
from FoodCentralAPI.models.food_list_criteria import FoodListCriteria  # noqa: E501
from FoodCentralAPI.models.food_search_criteria import FoodSearchCriteria  # noqa: E501
from FoodCentralAPI.models.foods_criteria import FoodsCriteria  # noqa: E501
from FoodCentralAPI.models.inline_response200 import InlineResponse200  # noqa: E501
from FoodCentralAPI.models.search_result import SearchResult  # noqa: E501
from FoodCentralAPI import util


def get_food(fdc_id, format=None, nutrients=None):  # noqa: E501
    """Fetches details for one food item by FDC ID

    Retrieves a single food item by an FDC ID. Optional format and nutrients can be specified. # noqa: E501

    :param fdc_id: FDC id of the food to retrieve
    :type fdc_id: str
    :param format: Optional. &#x27;abridged&#x27; for an abridged set of elements, &#x27;full&#x27; for all elements (default).
    :type format: str
    :param nutrients: Optional. List of up to 25 nutrient numbers. Only the nutrient information for the specified nutrients will be returned. Should be comma separated list (e.g. nutrients&#x3D;203,204) or repeating parameters (e.g. nutrients&#x3D;203&amp;nutrients&#x3D;204). If a food does not have any matching nutrients, the food will be returned with an empty foodNutrients element.
    :type nutrients: List[int]

    :rtype: InlineResponse200
    """
    return 'do some magic!'


def get_foods(fdc_ids, format=None, nutrients=None):  # noqa: E501
    """Fetches details for multiple food items using input FDC IDs

    Retrieves a list of food items by a list of up to 20 FDC IDs. Optional format and nutrients can be specified. Invalid FDC ID&#x27;s or ones that are not found are omitted and an empty set is returned if there are no matches. # noqa: E501

    :param fdc_ids: List of multiple FDC ID&#x27;s. Should be comma separated list (e.g. fdcIds&#x3D;534358,373052) or repeating parameters (e.g. fdcIds&#x3D;534358&amp;fdcIds&#x3D;373052).
    :type fdc_ids: List[str]
    :param format: Optional. &#x27;abridged&#x27; for an abridged set of elements, &#x27;full&#x27; for all elements (default).
    :type format: str
    :param nutrients: Optional. List of up to 25 nutrient numbers. Only the nutrient information for the specified nutrients will be returned. Should be comma separated list (e.g. nutrients&#x3D;203,204) or repeating parameters (e.g. nutrients&#x3D;203&amp;nutrients&#x3D;204). If a food does not have any matching nutrients, the food will be returned with an empty foodNutrients element.
    :type nutrients: List[int]

    :rtype: List[Object]
    """
    return 'do some magic!'


def get_foods_list(data_type=None, page_size=None, page_number=None, sort_by=None, sort_order=None):  # noqa: E501
    """Returns a paged list of foods, in the &#x27;abridged&#x27; format

    Retrieves a paged list of foods. Use the pageNumber parameter to page through the entire result set. # noqa: E501

    :param data_type: Optional. Filter on a specific data type; specify one or more values in an array.
    :type data_type: List[str]
    :param page_size: Optional. Maximum number of results to return for the current page. Default is 50.
    :type page_size: int
    :param page_number: Optional. Page number to retrieve. The offset into the overall result set is expressed as (pageNumber * pageSize)
    :type page_number: int
    :param sort_by: Optional. Specify one of the possible values to sort by that field. Note, dataType.keyword will be dataType and lowercaseDescription.keyword will be description in future releases.
    :type sort_by: str
    :param sort_order: Optional. The sort direction for the results. Only applicable if sortBy is specified.
    :type sort_order: str

    :rtype: List[AbridgedFoodItem]
    """
    return 'do some magic!'


def get_foods_search(query, data_type=None, page_size=None, page_number=None, sort_by=None, sort_order=None, brand_owner=None):  # noqa: E501
    """Returns a list of foods that matched search (query) keywords

    Search for foods using keywords. Results can be filtered by dataType and there are options for result page sizes or sorting. # noqa: E501

    :param query: One or more search terms.  The string may include [search operators](https://fdc.nal.usda.gov/help.html#bkmk-2)
    :type query: str
    :param data_type: Optional. Filter on a specific data type; specify one or more values in an array.
    :type data_type: List[str]
    :param page_size: Optional. Maximum number of results to return for the current page. Default is 50.
    :type page_size: int
    :param page_number: Optional. Page number to retrieve. The offset into the overall result set is expressed as (pageNumber * pageSize)
    :type page_number: int
    :param sort_by: Optional. Specify one of the possible values to sort by that field. Note, dataType.keyword will be dataType and lowercaseDescription.keyword will be description in future releases.
    :type sort_by: str
    :param sort_order: Optional. The sort direction for the results. Only applicable if sortBy is specified.
    :type sort_order: str
    :param brand_owner: Optional. Filter results based on the brand owner of the food. Only applies to Branded Foods
    :type brand_owner: str

    :rtype: SearchResult
    """
    return 'do some magic!'


def get_json_spec():  # noqa: E501
    """Returns this documentation in JSON format

    The OpenAPI 3.0 specification for the FDC API rendered as JSON (JavaScript Object Notation) # noqa: E501


    :rtype: None
    """
    return 'do some magic!'


def get_yaml_spec():  # noqa: E501
    """Returns this documentation in JSON format

    The OpenAPI 3.0 specification for the FDC API rendered as YAML (YAML Ain&#x27;t Markup Language) # noqa: E501


    :rtype: None
    """
    return 'do some magic!'


def post_foods(body):  # noqa: E501
    """Fetches details for multiple food items using input FDC IDs

    Retrieves a list of food items by a list of up to 20 FDC IDs. Optional format and nutrients can be specified. Invalid FDC ID&#x27;s or ones that are not found are omitted and an empty set is returned if there are no matches. # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: List[Object]
    """
    if connexion.request.is_json:
        body = FoodsCriteria.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'


def post_foods_list(body):  # noqa: E501
    """Returns a paged list of foods, in the &#x27;abridged&#x27; format

    Retrieves a paged list of foods. Use the pageNumber parameter to page through the entire result set. # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: List[AbridgedFoodItem]
    """
    if connexion.request.is_json:
        body = FoodListCriteria.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'


def post_foods_search(body):  # noqa: E501
    """Returns a list of foods that matched search (query) keywords

    Search for foods using keywords. Results can be filtered by dataType and there are options for result page sizes or sorting. # noqa: E501

    :param body: The query string may also include standard [search operators](https://fdc.nal.usda.gov/help.html#bkmk-2)
    :type body: dict | bytes

    :rtype: SearchResult
    """
    if connexion.request.is_json:
        body = FoodSearchCriteria.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'
