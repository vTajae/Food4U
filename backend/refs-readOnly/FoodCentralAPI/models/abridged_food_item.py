# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI.models.abridged_food_nutrient import AbridgedFoodNutrient  # noqa: F401,E501
from FoodCentralAPI import util


class AbridgedFoodItem(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, data_type: str=None, description: str=None, fdc_id: int=None, food_nutrients: List[AbridgedFoodNutrient]=None, publication_date: str=None, brand_owner: str=None, gtin_upc: str=None, ndb_number: int=None, food_code: str=None):  # noqa: E501
        """AbridgedFoodItem - a model defined in Swagger

        :param data_type: The data_type of this AbridgedFoodItem.  # noqa: E501
        :type data_type: str
        :param description: The description of this AbridgedFoodItem.  # noqa: E501
        :type description: str
        :param fdc_id: The fdc_id of this AbridgedFoodItem.  # noqa: E501
        :type fdc_id: int
        :param food_nutrients: The food_nutrients of this AbridgedFoodItem.  # noqa: E501
        :type food_nutrients: List[AbridgedFoodNutrient]
        :param publication_date: The publication_date of this AbridgedFoodItem.  # noqa: E501
        :type publication_date: str
        :param brand_owner: The brand_owner of this AbridgedFoodItem.  # noqa: E501
        :type brand_owner: str
        :param gtin_upc: The gtin_upc of this AbridgedFoodItem.  # noqa: E501
        :type gtin_upc: str
        :param ndb_number: The ndb_number of this AbridgedFoodItem.  # noqa: E501
        :type ndb_number: int
        :param food_code: The food_code of this AbridgedFoodItem.  # noqa: E501
        :type food_code: str
        """
        self.swagger_types = {
            'data_type': str,
            'description': str,
            'fdc_id': int,
            'food_nutrients': List[AbridgedFoodNutrient],
            'publication_date': str,
            'brand_owner': str,
            'gtin_upc': str,
            'ndb_number': int,
            'food_code': str
        }

        self.attribute_map = {
            'data_type': 'dataType',
            'description': 'description',
            'fdc_id': 'fdcId',
            'food_nutrients': 'foodNutrients',
            'publication_date': 'publicationDate',
            'brand_owner': 'brandOwner',
            'gtin_upc': 'gtinUpc',
            'ndb_number': 'ndbNumber',
            'food_code': 'foodCode'
        }
        self._data_type = data_type
        self._description = description
        self._fdc_id = fdc_id
        self._food_nutrients = food_nutrients
        self._publication_date = publication_date
        self._brand_owner = brand_owner
        self._gtin_upc = gtin_upc
        self._ndb_number = ndb_number
        self._food_code = food_code

    @classmethod
    def from_dict(cls, dikt) -> 'AbridgedFoodItem':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The AbridgedFoodItem of this AbridgedFoodItem.  # noqa: E501
        :rtype: AbridgedFoodItem
        """
        return util.deserialize_model(dikt, cls)

    @property
    def data_type(self) -> str:
        """Gets the data_type of this AbridgedFoodItem.


        :return: The data_type of this AbridgedFoodItem.
        :rtype: str
        """
        return self._data_type

    @data_type.setter
    def data_type(self, data_type: str):
        """Sets the data_type of this AbridgedFoodItem.


        :param data_type: The data_type of this AbridgedFoodItem.
        :type data_type: str
        """
        if data_type is None:
            raise ValueError("Invalid value for `data_type`, must not be `None`")  # noqa: E501

        self._data_type = data_type

    @property
    def description(self) -> str:
        """Gets the description of this AbridgedFoodItem.


        :return: The description of this AbridgedFoodItem.
        :rtype: str
        """
        return self._description

    @description.setter
    def description(self, description: str):
        """Sets the description of this AbridgedFoodItem.


        :param description: The description of this AbridgedFoodItem.
        :type description: str
        """
        if description is None:
            raise ValueError("Invalid value for `description`, must not be `None`")  # noqa: E501

        self._description = description

    @property
    def fdc_id(self) -> int:
        """Gets the fdc_id of this AbridgedFoodItem.


        :return: The fdc_id of this AbridgedFoodItem.
        :rtype: int
        """
        return self._fdc_id

    @fdc_id.setter
    def fdc_id(self, fdc_id: int):
        """Sets the fdc_id of this AbridgedFoodItem.


        :param fdc_id: The fdc_id of this AbridgedFoodItem.
        :type fdc_id: int
        """
        if fdc_id is None:
            raise ValueError("Invalid value for `fdc_id`, must not be `None`")  # noqa: E501

        self._fdc_id = fdc_id

    @property
    def food_nutrients(self) -> List[AbridgedFoodNutrient]:
        """Gets the food_nutrients of this AbridgedFoodItem.


        :return: The food_nutrients of this AbridgedFoodItem.
        :rtype: List[AbridgedFoodNutrient]
        """
        return self._food_nutrients

    @food_nutrients.setter
    def food_nutrients(self, food_nutrients: List[AbridgedFoodNutrient]):
        """Sets the food_nutrients of this AbridgedFoodItem.


        :param food_nutrients: The food_nutrients of this AbridgedFoodItem.
        :type food_nutrients: List[AbridgedFoodNutrient]
        """

        self._food_nutrients = food_nutrients

    @property
    def publication_date(self) -> str:
        """Gets the publication_date of this AbridgedFoodItem.


        :return: The publication_date of this AbridgedFoodItem.
        :rtype: str
        """
        return self._publication_date

    @publication_date.setter
    def publication_date(self, publication_date: str):
        """Sets the publication_date of this AbridgedFoodItem.


        :param publication_date: The publication_date of this AbridgedFoodItem.
        :type publication_date: str
        """

        self._publication_date = publication_date

    @property
    def brand_owner(self) -> str:
        """Gets the brand_owner of this AbridgedFoodItem.

        only applies to Branded Foods  # noqa: E501

        :return: The brand_owner of this AbridgedFoodItem.
        :rtype: str
        """
        return self._brand_owner

    @brand_owner.setter
    def brand_owner(self, brand_owner: str):
        """Sets the brand_owner of this AbridgedFoodItem.

        only applies to Branded Foods  # noqa: E501

        :param brand_owner: The brand_owner of this AbridgedFoodItem.
        :type brand_owner: str
        """

        self._brand_owner = brand_owner

    @property
    def gtin_upc(self) -> str:
        """Gets the gtin_upc of this AbridgedFoodItem.

        only applies to Branded Foods  # noqa: E501

        :return: The gtin_upc of this AbridgedFoodItem.
        :rtype: str
        """
        return self._gtin_upc

    @gtin_upc.setter
    def gtin_upc(self, gtin_upc: str):
        """Sets the gtin_upc of this AbridgedFoodItem.

        only applies to Branded Foods  # noqa: E501

        :param gtin_upc: The gtin_upc of this AbridgedFoodItem.
        :type gtin_upc: str
        """

        self._gtin_upc = gtin_upc

    @property
    def ndb_number(self) -> int:
        """Gets the ndb_number of this AbridgedFoodItem.

        only applies to Foundation and SRLegacy Foods  # noqa: E501

        :return: The ndb_number of this AbridgedFoodItem.
        :rtype: int
        """
        return self._ndb_number

    @ndb_number.setter
    def ndb_number(self, ndb_number: int):
        """Sets the ndb_number of this AbridgedFoodItem.

        only applies to Foundation and SRLegacy Foods  # noqa: E501

        :param ndb_number: The ndb_number of this AbridgedFoodItem.
        :type ndb_number: int
        """

        self._ndb_number = ndb_number

    @property
    def food_code(self) -> str:
        """Gets the food_code of this AbridgedFoodItem.

        only applies to Survey Foods  # noqa: E501

        :return: The food_code of this AbridgedFoodItem.
        :rtype: str
        """
        return self._food_code

    @food_code.setter
    def food_code(self, food_code: str):
        """Sets the food_code of this AbridgedFoodItem.

        only applies to Survey Foods  # noqa: E501

        :param food_code: The food_code of this AbridgedFoodItem.
        :type food_code: str
        """

        self._food_code = food_code
