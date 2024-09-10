# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from FoodCentralAPI.models.abridged_food_item import AbridgedFoodItem  # noqa: E501
from FoodCentralAPI.models.food_list_criteria import FoodListCriteria  # noqa: E501
from FoodCentralAPI.models.food_search_criteria import FoodSearchCriteria  # noqa: E501
from FoodCentralAPI.models.foods_criteria import FoodsCriteria  # noqa: E501
from FoodCentralAPI.models.inline_response200 import InlineResponse200  # noqa: E501
from FoodCentralAPI.models.search_result import SearchResult  # noqa: E501
from FoodCentralAPI.test import BaseTestCase


class TestFDCController(BaseTestCase):
    """FDCController integration test stubs"""

    def test_get_food(self):
        """Test case for get_food

        Fetches details for one food item by FDC ID
        """
        query_string = [('format', 'format_example'),
                        ('nutrients', 56)]
        response = self.client.open(
            '/fdc/v1/food/{fdcId}'.format(fdc_id='fdc_id_example'),
            method='GET',
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_foods(self):
        """Test case for get_foods

        Fetches details for multiple food items using input FDC IDs
        """
        query_string = [('fdc_ids', 'fdc_ids_example'),
                        ('format', 'format_example'),
                        ('nutrients', 56)]
        response = self.client.open(
            '/fdc/v1/foods',
            method='GET',
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_foods_list(self):
        """Test case for get_foods_list

        Returns a paged list of foods, in the 'abridged' format
        """
        query_string = [('data_type', 'data_type_example'),
                        ('page_size', 200),
                        ('page_number', 56),
                        ('sort_by', 'sort_by_example'),
                        ('sort_order', 'sort_order_example')]
        response = self.client.open(
            '/fdc/v1/foods/list',
            method='GET',
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_foods_search(self):
        """Test case for get_foods_search

        Returns a list of foods that matched search (query) keywords
        """
        query_string = [('query', 'query_example'),
                        ('data_type', 'data_type_example'),
                        ('page_size', 200),
                        ('page_number', 56),
                        ('sort_by', 'sort_by_example'),
                        ('sort_order', 'sort_order_example'),
                        ('brand_owner', 'brand_owner_example')]
        response = self.client.open(
            '/fdc/v1/foods/search',
            method='GET',
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_json_spec(self):
        """Test case for get_json_spec

        Returns this documentation in JSON format
        """
        response = self.client.open(
            '/fdc/v1/json-spec',
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_yaml_spec(self):
        """Test case for get_yaml_spec

        Returns this documentation in JSON format
        """
        response = self.client.open(
            '/fdc/v1/yaml-spec',
            method='GET')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_post_foods(self):
        """Test case for post_foods

        Fetches details for multiple food items using input FDC IDs
        """
        body = FoodsCriteria()
        response = self.client.open(
            '/fdc/v1/foods',
            method='POST',
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_post_foods_list(self):
        """Test case for post_foods_list

        Returns a paged list of foods, in the 'abridged' format
        """
        body = FoodListCriteria()
        response = self.client.open(
            '/fdc/v1/foods/list',
            method='POST',
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_post_foods_search(self):
        """Test case for post_foods_search

        Returns a list of foods that matched search (query) keywords
        """
        body = FoodSearchCriteria()
        response = self.client.open(
            '/fdc/v1/foods/search',
            method='POST',
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
