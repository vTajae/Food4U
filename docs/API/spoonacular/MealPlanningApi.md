# spoonacular.MealPlanningApi

All URIs are relative to *https://api.spoonacular.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**add_meal_plan_template**](MealPlanningApi.md#add_meal_plan_template) | **POST** /mealplanner/{username}/templates | Add Meal Plan Template
[**add_to_meal_plan**](MealPlanningApi.md#add_to_meal_plan) | **POST** /mealplanner/{username}/items | Add to Meal Plan
[**add_to_shopping_list**](MealPlanningApi.md#add_to_shopping_list) | **POST** /mealplanner/{username}/shopping-list/items | Add to Shopping List
[**clear_meal_plan_day**](MealPlanningApi.md#clear_meal_plan_day) | **DELETE** /mealplanner/{username}/day/{date} | Clear Meal Plan Day
[**connect_user**](MealPlanningApi.md#connect_user) | **POST** /users/connect | Connect User
[**delete_from_meal_plan**](MealPlanningApi.md#delete_from_meal_plan) | **DELETE** /mealplanner/{username}/items/{id} | Delete from Meal Plan
[**delete_from_shopping_list**](MealPlanningApi.md#delete_from_shopping_list) | **DELETE** /mealplanner/{username}/shopping-list/items/{id} | Delete from Shopping List
[**delete_meal_plan_template**](MealPlanningApi.md#delete_meal_plan_template) | **DELETE** /mealplanner/{username}/templates/{id} | Delete Meal Plan Template
[**generate_meal_plan**](MealPlanningApi.md#generate_meal_plan) | **GET** /mealplanner/generate | Generate Meal Plan
[**generate_shopping_list**](MealPlanningApi.md#generate_shopping_list) | **POST** /mealplanner/{username}/shopping-list/{start_date}/{end_date} | Generate Shopping List
[**get_meal_plan_template**](MealPlanningApi.md#get_meal_plan_template) | **GET** /mealplanner/{username}/templates/{id} | Get Meal Plan Template
[**get_meal_plan_templates**](MealPlanningApi.md#get_meal_plan_templates) | **GET** /mealplanner/{username}/templates | Get Meal Plan Templates
[**get_meal_plan_week**](MealPlanningApi.md#get_meal_plan_week) | **GET** /mealplanner/{username}/week/{start_date} | Get Meal Plan Week
[**get_shopping_list**](MealPlanningApi.md#get_shopping_list) | **GET** /mealplanner/{username}/shopping-list | Get Shopping List


# **add_meal_plan_template**
> AddMealPlanTemplate200Response add_meal_plan_template(username, hash)

Add Meal Plan Template

Add a meal plan template for a user.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.add_meal_plan_template200_response import AddMealPlanTemplate200Response
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    hash = '4b5v4398573406' # str | The private hash for the username.

    try:
        # Add Meal Plan Template
        api_response = api_instance.add_meal_plan_template(username, hash)
        print("The response of MealPlanningApi->add_meal_plan_template:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->add_meal_plan_template: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

[**AddMealPlanTemplate200Response**](AddMealPlanTemplate200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **add_to_meal_plan**
> object add_to_meal_plan(username, hash, add_to_meal_plan_request)

Add to Meal Plan

Add an item to the user's meal plan.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.add_to_meal_plan_request import AddToMealPlanRequest
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    hash = 'hash_example' # str | The private hash for the username.
    add_to_meal_plan_request = {"date":1589500800,"slot":1,"position":0,"type":"INGREDIENTS","value":{"ingredients":[{"name":"1 banana"}]}} # AddToMealPlanRequest | 

    try:
        # Add to Meal Plan
        api_response = api_instance.add_to_meal_plan(username, hash, add_to_meal_plan_request)
        print("The response of MealPlanningApi->add_to_meal_plan:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->add_to_meal_plan: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **hash** | **str**| The private hash for the username. | 
 **add_to_meal_plan_request** | [**AddToMealPlanRequest**](AddToMealPlanRequest.md)|  | 

### Return type

**object**

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **add_to_shopping_list**
> GetShoppingList200Response add_to_shopping_list(username, hash, add_to_shopping_list_request)

Add to Shopping List

Add an item to the current shopping list of a user.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.add_to_shopping_list_request import AddToShoppingListRequest
from spoonacular.models.get_shopping_list200_response import GetShoppingList200Response
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    hash = 'hash_example' # str | The private hash for the username.
    add_to_shopping_list_request = {"item":"1 package baking powder","aisle":"Baking","parse":true} # AddToShoppingListRequest | 

    try:
        # Add to Shopping List
        api_response = api_instance.add_to_shopping_list(username, hash, add_to_shopping_list_request)
        print("The response of MealPlanningApi->add_to_shopping_list:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->add_to_shopping_list: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **hash** | **str**| The private hash for the username. | 
 **add_to_shopping_list_request** | [**AddToShoppingListRequest**](AddToShoppingListRequest.md)|  | 

### Return type

[**GetShoppingList200Response**](GetShoppingList200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **clear_meal_plan_day**
> object clear_meal_plan_day(username, var_date, hash)

Clear Meal Plan Day

Delete all planned items from the user's meal plan for a specific day.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    var_date = '2020-06-01' # str | The date in the format yyyy-mm-dd.
    hash = 'hash_example' # str | The private hash for the username.

    try:
        # Clear Meal Plan Day
        api_response = api_instance.clear_meal_plan_day(username, var_date, hash)
        print("The response of MealPlanningApi->clear_meal_plan_day:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->clear_meal_plan_day: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **var_date** | **str**| The date in the format yyyy-mm-dd. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

**object**

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **connect_user**
> ConnectUser200Response connect_user(connect_user_request)

Connect User

In order to call user-specific endpoints, you need to connect your app's users to spoonacular users.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.connect_user200_response import ConnectUser200Response
from spoonacular.models.connect_user_request import ConnectUserRequest
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    connect_user_request = {"username":"your user's name","firstName":"your user's first name","lastName":"your user's last name","email":"your user's email"} # ConnectUserRequest | 

    try:
        # Connect User
        api_response = api_instance.connect_user(connect_user_request)
        print("The response of MealPlanningApi->connect_user:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->connect_user: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connect_user_request** | [**ConnectUserRequest**](ConnectUserRequest.md)|  | 

### Return type

[**ConnectUser200Response**](ConnectUser200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_from_meal_plan**
> object delete_from_meal_plan(username, id, hash)

Delete from Meal Plan

Delete an item from the user's meal plan.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    id = 15678 # int | The shopping list item id.
    hash = 'hash_example' # str | The private hash for the username.

    try:
        # Delete from Meal Plan
        api_response = api_instance.delete_from_meal_plan(username, id, hash)
        print("The response of MealPlanningApi->delete_from_meal_plan:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->delete_from_meal_plan: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **id** | **int**| The shopping list item id. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

**object**

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_from_shopping_list**
> object delete_from_shopping_list(username, id, hash)

Delete from Shopping List

Delete an item from the current shopping list of the user.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    id = 15678 # int | The shopping list item id.
    hash = 'hash_example' # str | The private hash for the username.

    try:
        # Delete from Shopping List
        api_response = api_instance.delete_from_shopping_list(username, id, hash)
        print("The response of MealPlanningApi->delete_from_shopping_list:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->delete_from_shopping_list: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **id** | **int**| The shopping list item id. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

**object**

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_meal_plan_template**
> object delete_meal_plan_template(username, id, hash)

Delete Meal Plan Template

Delete a meal plan template for a user.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    id = 15678 # int | The shopping list item id.
    hash = '4b5v4398573406' # str | The private hash for the username.

    try:
        # Delete Meal Plan Template
        api_response = api_instance.delete_meal_plan_template(username, id, hash)
        print("The response of MealPlanningApi->delete_meal_plan_template:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->delete_meal_plan_template: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **id** | **int**| The shopping list item id. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

**object**

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **generate_meal_plan**
> GenerateMealPlan200Response generate_meal_plan(time_frame=time_frame, target_calories=target_calories, diet=diet, exclude=exclude)

Generate Meal Plan

Generate a meal plan with three meals per day (breakfast, lunch, and dinner).

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.generate_meal_plan200_response import GenerateMealPlan200Response
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    time_frame = 'day' # str | Either for one \"day\" or an entire \"week\". (optional)
    target_calories = 2000 # float | What is the caloric target for one day? The meal plan generator will try to get as close as possible to that goal. (optional)
    diet = 'vegetarian' # str | Enter a diet that the meal plan has to adhere to. See a full list of supported diets. (optional)
    exclude = 'shellfish, olives' # str | A comma-separated list of allergens or ingredients that must be excluded. (optional)

    try:
        # Generate Meal Plan
        api_response = api_instance.generate_meal_plan(time_frame=time_frame, target_calories=target_calories, diet=diet, exclude=exclude)
        print("The response of MealPlanningApi->generate_meal_plan:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->generate_meal_plan: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **time_frame** | **str**| Either for one \&quot;day\&quot; or an entire \&quot;week\&quot;. | [optional] 
 **target_calories** | **float**| What is the caloric target for one day? The meal plan generator will try to get as close as possible to that goal. | [optional] 
 **diet** | **str**| Enter a diet that the meal plan has to adhere to. See a full list of supported diets. | [optional] 
 **exclude** | **str**| A comma-separated list of allergens or ingredients that must be excluded. | [optional] 

### Return type

[**GenerateMealPlan200Response**](GenerateMealPlan200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **generate_shopping_list**
> GetShoppingList200Response generate_shopping_list(username, start_date, end_date, hash)

Generate Shopping List

Generate the shopping list for a user from the meal planner in a given time frame.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.get_shopping_list200_response import GetShoppingList200Response
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    start_date = '2020-06-01' # str | The start date in the format yyyy-mm-dd.
    end_date = '2020-06-07' # str | The end date in the format yyyy-mm-dd.
    hash = 'hash_example' # str | The private hash for the username.

    try:
        # Generate Shopping List
        api_response = api_instance.generate_shopping_list(username, start_date, end_date, hash)
        print("The response of MealPlanningApi->generate_shopping_list:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->generate_shopping_list: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **start_date** | **str**| The start date in the format yyyy-mm-dd. | 
 **end_date** | **str**| The end date in the format yyyy-mm-dd. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

[**GetShoppingList200Response**](GetShoppingList200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_meal_plan_template**
> GetMealPlanTemplate200Response get_meal_plan_template(username, id, hash)

Get Meal Plan Template

Get information about a meal plan template.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.get_meal_plan_template200_response import GetMealPlanTemplate200Response
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    id = 15678 # int | The shopping list item id.
    hash = 'hash_example' # str | The private hash for the username.

    try:
        # Get Meal Plan Template
        api_response = api_instance.get_meal_plan_template(username, id, hash)
        print("The response of MealPlanningApi->get_meal_plan_template:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->get_meal_plan_template: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **id** | **int**| The shopping list item id. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

[**GetMealPlanTemplate200Response**](GetMealPlanTemplate200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_meal_plan_templates**
> GetMealPlanTemplates200Response get_meal_plan_templates(username, hash)

Get Meal Plan Templates

Get meal plan templates from user or public ones.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.get_meal_plan_templates200_response import GetMealPlanTemplates200Response
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    hash = 'hash_example' # str | The private hash for the username.

    try:
        # Get Meal Plan Templates
        api_response = api_instance.get_meal_plan_templates(username, hash)
        print("The response of MealPlanningApi->get_meal_plan_templates:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->get_meal_plan_templates: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

[**GetMealPlanTemplates200Response**](GetMealPlanTemplates200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_meal_plan_week**
> GetMealPlanWeek200Response get_meal_plan_week(username, start_date, hash)

Get Meal Plan Week

Retrieve a meal planned week for the given user. The username must be a spoonacular user and the hash must the the user's hash that can be found in his/her account.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.get_meal_plan_week200_response import GetMealPlanWeek200Response
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    start_date = '2020-06-01' # str | The start date of the meal planned week in the format yyyy-mm-dd.
    hash = 'hash_example' # str | The private hash for the username.

    try:
        # Get Meal Plan Week
        api_response = api_instance.get_meal_plan_week(username, start_date, hash)
        print("The response of MealPlanningApi->get_meal_plan_week:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->get_meal_plan_week: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **start_date** | **str**| The start date of the meal planned week in the format yyyy-mm-dd. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

[**GetMealPlanWeek200Response**](GetMealPlanWeek200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_shopping_list**
> GetShoppingList200Response get_shopping_list(username, hash)

Get Shopping List

Get the current shopping list for the given user.

### Example

* Api Key Authentication (apiKeyScheme):

```python
import spoonacular
from spoonacular.models.get_shopping_list200_response import GetShoppingList200Response
from spoonacular.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://api.spoonacular.com
# See configuration.py for a list of all supported configuration parameters.
configuration = spoonacular.Configuration(
    host = "https://api.spoonacular.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: apiKeyScheme
configuration.api_key['apiKeyScheme'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['apiKeyScheme'] = 'Bearer'

# Enter a context with an instance of the API client
with spoonacular.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = spoonacular.MealPlanningApi(api_client)
    username = 'dsky' # str | The username.
    hash = 'hash_example' # str | The private hash for the username.

    try:
        # Get Shopping List
        api_response = api_instance.get_shopping_list(username, hash)
        print("The response of MealPlanningApi->get_shopping_list:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MealPlanningApi->get_shopping_list: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **username** | **str**| The username. | 
 **hash** | **str**| The private hash for the username. | 

### Return type

[**GetShoppingList200Response**](GetShoppingList200Response.md)

### Authorization

[apiKeyScheme](../README.md#apiKeyScheme)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**401** | Unauthorized |  -  |
**403** | Forbidden |  -  |
**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

