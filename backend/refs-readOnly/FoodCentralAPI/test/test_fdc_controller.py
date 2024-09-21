import json
import pytest
from fastapi.testclient import TestClient
from server import app

# Create a TestClient for the FastAPI app
client = TestClient(app)

def test_get_food():
    """Test case for getting a single food item by FDC ID"""
    query_params = {
        'format': 'format_example',
        'nutrients': 56
    }
    response = client.get('/fdc/v1/food/fdc_id_example', params=query_params)
    
    assert response.status_code == 200
    assert 'expected_field' in response.json()  # Adjust this assertion for expected response structure


def test_get_foods():
    """Test case for getting multiple food items using FDC IDs"""
    query_params = {
        'fdc_ids': 'fdc_ids_example',
        'format': 'format_example',
        'nutrients': 56
    }
    response = client.get('/fdc/v1/foods', params=query_params)

    assert response.status_code == 200
    assert isinstance(response.json(), list)  # Expecting a list of food items


def test_get_foods_list():
    """Test case for getting a paged list of foods in abridged format"""
    query_params = {
        'data_type': 'data_type_example',
        'page_size': 200,
        'page_number': 56,
        'sort_by': 'sort_by_example',
        'sort_order': 'sort_order_example'
    }
    response = client.get('/fdc/v1/foods/list', params=query_params)

    assert response.status_code == 200
    assert 'foods' in response.json()  # Adjust to match your actual JSON structure


def test_get_foods_search():
    """Test case for searching foods by query"""
    query_params = {
        'query': 'query_example',
        'data_type': 'data_type_example',
        'page_size': 200,
        'page_number': 56,
        'sort_by': 'sort_by_example',
        'sort_order': 'sort_order_example',
        'brand_owner': 'brand_owner_example'
    }
    response = client.get('/fdc/v1/foods/search', params=query_params)

    assert response.status_code == 200
    assert 'search_results' in response.json()  # Adjust to match actual response


def test_get_json_spec():
    """Test case for retrieving API spec in JSON format"""
    response = client.get('/fdc/v1/json-spec')

    assert response.status_code == 200
    assert response.headers['Content-Type'] == 'application/json'


def test_get_yaml_spec():
    """Test case for retrieving API spec in YAML format"""
    response = client.get('/fdc/v1/yaml-spec')

    assert response.status_code == 200
    assert response.headers['Content-Type'] == 'application/x-yaml'


def test_post_foods():
    """Test case for posting multiple FDC IDs and getting food details"""
    body = {
        # Example payload based on your FoodCriteria model
        'fdc_ids': [12345, 67890],
        'format': 'abridged'
    }
    response = client.post(
        '/fdc/v1/foods',
        data=json.dumps(body),
        headers={'Content-Type': 'application/json'}
    )

    assert response.status_code == 200
    assert 'food_details' in response.json()  # Adjust to match actual response structure


def test_post_foods_list():
    """Test case for posting criteria to get paged list of foods"""
    body = {
        # Example payload based on your FoodListCriteria model
        'data_type': 'Branded',
        'page_size': 50,
        'page_number': 1
    }
    response = client.post(
        '/fdc/v1/foods/list',
        data=json.dumps(body),
        headers={'Content-Type': 'application/json'}
    )

    assert response.status_code == 200
    assert 'foods' in response.json()  # Adjust to match actual response structure


def test_post_foods_search():
    """Test case for posting search criteria and getting matching food results"""
    body = {
        # Example payload based on your FoodSearchCriteria model
        'query': 'apple',
        'page_size': 10,
        'page_number': 1
    }
    response = client.post(
        '/fdc/v1/foods/search',
        data=json.dumps(body),
        headers={'Content-Type': 'application/json'}
    )

    assert response.status_code == 200
    assert 'results' in response.json()  # Adjust to match actual response structure
