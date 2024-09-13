# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI.models.abridged_food_nutrient import AbridgedFoodNutrient  # noqa: F401,E501
from FoodCentralAPI import util


class SearchResultFood(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, fdc_id: int=None, data_type: str=None, description: str=None, food_code: str=None, food_nutrients: List[AbridgedFoodNutrient]=None, publication_date: str=None, scientific_name: str=None, brand_owner: str=None, gtin_upc: str=None, ingredients: str=None, ndb_number: int=None, additional_descriptions: str=None, all_highlight_fields: str=None, score: float=None):  # noqa: E501
        """SearchResultFood - a model defined in Swagger

        :param fdc_id: The fdc_id of this SearchResultFood.  # noqa: E501
        :type fdc_id: int
        :param data_type: The data_type of this SearchResultFood.  # noqa: E501
        :type data_type: str
        :param description: The description of this SearchResultFood.  # noqa: E501
        :type description: str
        :param food_code: The food_code of this SearchResultFood.  # noqa: E501
        :type food_code: str
        :param food_nutrients: The food_nutrients of this SearchResultFood.  # noqa: E501
        :type food_nutrients: List[AbridgedFoodNutrient]
        :param publication_date: The publication_date of this SearchResultFood.  # noqa: E501
        :type publication_date: str
        :param scientific_name: The scientific_name of this SearchResultFood.  # noqa: E501
        :type scientific_name: str
        :param brand_owner: The brand_owner of this SearchResultFood.  # noqa: E501
        :type brand_owner: str
        :param gtin_upc: The gtin_upc of this SearchResultFood.  # noqa: E501
        :type gtin_upc: str
        :param ingredients: The ingredients of this SearchResultFood.  # noqa: E501
        :type ingredients: str
        :param ndb_number: The ndb_number of this SearchResultFood.  # noqa: E501
        :type ndb_number: int
        :param additional_descriptions: The additional_descriptions of this SearchResultFood.  # noqa: E501
        :type additional_descriptions: str
        :param all_highlight_fields: The all_highlight_fields of this SearchResultFood.  # noqa: E501
        :type all_highlight_fields: str
        :param score: The score of this SearchResultFood.  # noqa: E501
        :type score: float
        """
        self.swagger_types = {
            'fdc_id': int,
            'data_type': str,
            'description': str,
            'food_code': str,
            'food_nutrients': List[AbridgedFoodNutrient],
            'publication_date': str,
            'scientific_name': str,
            'brand_owner': str,
            'gtin_upc': str,
            'ingredients': str,
            'ndb_number': int,
            'additional_descriptions': str,
            'all_highlight_fields': str,
            'score': float
        }

        self.attribute_map = {
            'fdc_id': 'fdcId',
            'data_type': 'dataType',
            'description': 'description',
            'food_code': 'foodCode',
            'food_nutrients': 'foodNutrients',
            'publication_date': 'publicationDate',
            'scientific_name': 'scientificName',
            'brand_owner': 'brandOwner',
            'gtin_upc': 'gtinUpc',
            'ingredients': 'ingredients',
            'ndb_number': 'ndbNumber',
            'additional_descriptions': 'additionalDescriptions',
            'all_highlight_fields': 'allHighlightFields',
            'score': 'score'
        }
        self._fdc_id = fdc_id
        self._data_type = data_type
        self._description = description
        self._food_code = food_code
        self._food_nutrients = food_nutrients
        self._publication_date = publication_date
        self._scientific_name = scientific_name
        self._brand_owner = brand_owner
        self._gtin_upc = gtin_upc
        self._ingredients = ingredients
        self._ndb_number = ndb_number
        self._additional_descriptions = additional_descriptions
        self._all_highlight_fields = all_highlight_fields
        self._score = score

    @classmethod
    def from_dict(cls, dikt) -> 'SearchResultFood':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The SearchResultFood of this SearchResultFood.  # noqa: E501
        :rtype: SearchResultFood
        """
        return util.deserialize_model(dikt, cls)

    @property
    def fdc_id(self) -> int:
        """Gets the fdc_id of this SearchResultFood.

        Unique ID of the food.  # noqa: E501

        :return: The fdc_id of this SearchResultFood.
        :rtype: int
        """
        return self._fdc_id

    @fdc_id.setter
    def fdc_id(self, fdc_id: int):
        """Sets the fdc_id of this SearchResultFood.

        Unique ID of the food.  # noqa: E501

        :param fdc_id: The fdc_id of this SearchResultFood.
        :type fdc_id: int
        """
        if fdc_id is None:
            raise ValueError("Invalid value for `fdc_id`, must not be `None`")  # noqa: E501

        self._fdc_id = fdc_id

    @property
    def data_type(self) -> str:
        """Gets the data_type of this SearchResultFood.

        The type of the food data.  # noqa: E501

        :return: The data_type of this SearchResultFood.
        :rtype: str
        """
        return self._data_type

    @data_type.setter
    def data_type(self, data_type: str):
        """Sets the data_type of this SearchResultFood.

        The type of the food data.  # noqa: E501

        :param data_type: The data_type of this SearchResultFood.
        :type data_type: str
        """

        self._data_type = data_type

    @property
    def description(self) -> str:
        """Gets the description of this SearchResultFood.

        The description of the food.  # noqa: E501

        :return: The description of this SearchResultFood.
        :rtype: str
        """
        return self._description

    @description.setter
    def description(self, description: str):
        """Sets the description of this SearchResultFood.

        The description of the food.  # noqa: E501

        :param description: The description of this SearchResultFood.
        :type description: str
        """
        if description is None:
            raise ValueError("Invalid value for `description`, must not be `None`")  # noqa: E501

        self._description = description

    @property
    def food_code(self) -> str:
        """Gets the food_code of this SearchResultFood.

        Any A unique ID identifying the food within FNDDS.  # noqa: E501

        :return: The food_code of this SearchResultFood.
        :rtype: str
        """
        return self._food_code

    @food_code.setter
    def food_code(self, food_code: str):
        """Sets the food_code of this SearchResultFood.

        Any A unique ID identifying the food within FNDDS.  # noqa: E501

        :param food_code: The food_code of this SearchResultFood.
        :type food_code: str
        """

        self._food_code = food_code

    @property
    def food_nutrients(self) -> List[AbridgedFoodNutrient]:
        """Gets the food_nutrients of this SearchResultFood.


        :return: The food_nutrients of this SearchResultFood.
        :rtype: List[AbridgedFoodNutrient]
        """
        return self._food_nutrients

    @food_nutrients.setter
    def food_nutrients(self, food_nutrients: List[AbridgedFoodNutrient]):
        """Sets the food_nutrients of this SearchResultFood.


        :param food_nutrients: The food_nutrients of this SearchResultFood.
        :type food_nutrients: List[AbridgedFoodNutrient]
        """

        self._food_nutrients = food_nutrients

    @property
    def publication_date(self) -> str:
        """Gets the publication_date of this SearchResultFood.

        Date the item was published to FDC.  # noqa: E501

        :return: The publication_date of this SearchResultFood.
        :rtype: str
        """
        return self._publication_date

    @publication_date.setter
    def publication_date(self, publication_date: str):
        """Sets the publication_date of this SearchResultFood.

        Date the item was published to FDC.  # noqa: E501

        :param publication_date: The publication_date of this SearchResultFood.
        :type publication_date: str
        """

        self._publication_date = publication_date

    @property
    def scientific_name(self) -> str:
        """Gets the scientific_name of this SearchResultFood.

        The scientific name of the food.  # noqa: E501

        :return: The scientific_name of this SearchResultFood.
        :rtype: str
        """
        return self._scientific_name

    @scientific_name.setter
    def scientific_name(self, scientific_name: str):
        """Sets the scientific_name of this SearchResultFood.

        The scientific name of the food.  # noqa: E501

        :param scientific_name: The scientific_name of this SearchResultFood.
        :type scientific_name: str
        """

        self._scientific_name = scientific_name

    @property
    def brand_owner(self) -> str:
        """Gets the brand_owner of this SearchResultFood.

        Brand owner for the food. Only applies to Branded Foods.  # noqa: E501

        :return: The brand_owner of this SearchResultFood.
        :rtype: str
        """
        return self._brand_owner

    @brand_owner.setter
    def brand_owner(self, brand_owner: str):
        """Sets the brand_owner of this SearchResultFood.

        Brand owner for the food. Only applies to Branded Foods.  # noqa: E501

        :param brand_owner: The brand_owner of this SearchResultFood.
        :type brand_owner: str
        """

        self._brand_owner = brand_owner

    @property
    def gtin_upc(self) -> str:
        """Gets the gtin_upc of this SearchResultFood.

        GTIN or UPC code identifying the food. Only applies to Branded Foods.  # noqa: E501

        :return: The gtin_upc of this SearchResultFood.
        :rtype: str
        """
        return self._gtin_upc

    @gtin_upc.setter
    def gtin_upc(self, gtin_upc: str):
        """Sets the gtin_upc of this SearchResultFood.

        GTIN or UPC code identifying the food. Only applies to Branded Foods.  # noqa: E501

        :param gtin_upc: The gtin_upc of this SearchResultFood.
        :type gtin_upc: str
        """

        self._gtin_upc = gtin_upc

    @property
    def ingredients(self) -> str:
        """Gets the ingredients of this SearchResultFood.

        The list of ingredients (as it appears on the product label). Only applies to Branded Foods.  # noqa: E501

        :return: The ingredients of this SearchResultFood.
        :rtype: str
        """
        return self._ingredients

    @ingredients.setter
    def ingredients(self, ingredients: str):
        """Sets the ingredients of this SearchResultFood.

        The list of ingredients (as it appears on the product label). Only applies to Branded Foods.  # noqa: E501

        :param ingredients: The ingredients of this SearchResultFood.
        :type ingredients: str
        """

        self._ingredients = ingredients

    @property
    def ndb_number(self) -> int:
        """Gets the ndb_number of this SearchResultFood.

        Unique number assigned for foundation foods. Only applies to Foundation and SRLegacy Foods.  # noqa: E501

        :return: The ndb_number of this SearchResultFood.
        :rtype: int
        """
        return self._ndb_number

    @ndb_number.setter
    def ndb_number(self, ndb_number: int):
        """Sets the ndb_number of this SearchResultFood.

        Unique number assigned for foundation foods. Only applies to Foundation and SRLegacy Foods.  # noqa: E501

        :param ndb_number: The ndb_number of this SearchResultFood.
        :type ndb_number: int
        """

        self._ndb_number = ndb_number

    @property
    def additional_descriptions(self) -> str:
        """Gets the additional_descriptions of this SearchResultFood.

        Any additional descriptions of the food.  # noqa: E501

        :return: The additional_descriptions of this SearchResultFood.
        :rtype: str
        """
        return self._additional_descriptions

    @additional_descriptions.setter
    def additional_descriptions(self, additional_descriptions: str):
        """Sets the additional_descriptions of this SearchResultFood.

        Any additional descriptions of the food.  # noqa: E501

        :param additional_descriptions: The additional_descriptions of this SearchResultFood.
        :type additional_descriptions: str
        """

        self._additional_descriptions = additional_descriptions

    @property
    def all_highlight_fields(self) -> str:
        """Gets the all_highlight_fields of this SearchResultFood.

        allHighlightFields  # noqa: E501

        :return: The all_highlight_fields of this SearchResultFood.
        :rtype: str
        """
        return self._all_highlight_fields

    @all_highlight_fields.setter
    def all_highlight_fields(self, all_highlight_fields: str):
        """Sets the all_highlight_fields of this SearchResultFood.

        allHighlightFields  # noqa: E501

        :param all_highlight_fields: The all_highlight_fields of this SearchResultFood.
        :type all_highlight_fields: str
        """

        self._all_highlight_fields = all_highlight_fields

    @property
    def score(self) -> float:
        """Gets the score of this SearchResultFood.

        Relative score indicating how well the food matches the search criteria.  # noqa: E501

        :return: The score of this SearchResultFood.
        :rtype: float
        """
        return self._score

    @score.setter
    def score(self, score: float):
        """Sets the score of this SearchResultFood.

        Relative score indicating how well the food matches the search criteria.  # noqa: E501

        :param score: The score of this SearchResultFood.
        :type score: float
        """

        self._score = score
