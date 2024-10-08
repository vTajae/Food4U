# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI.models.food_attribute import FoodAttribute  # noqa: F401,E501
from FoodCentralAPI import util


class FoodUpdateLog(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, fdc_id: int=None, available_date: str=None, brand_owner: str=None, data_source: str=None, data_type: str=None, description: str=None, food_class: str=None, gtin_upc: str=None, household_serving_full_text: str=None, ingredients: str=None, modified_date: str=None, publication_date: str=None, serving_size: int=None, serving_size_unit: str=None, branded_food_category: str=None, changes: str=None, food_attributes: List[FoodAttribute]=None):  # noqa: E501
        """FoodUpdateLog - a model defined in Swagger

        :param fdc_id: The fdc_id of this FoodUpdateLog.  # noqa: E501
        :type fdc_id: int
        :param available_date: The available_date of this FoodUpdateLog.  # noqa: E501
        :type available_date: str
        :param brand_owner: The brand_owner of this FoodUpdateLog.  # noqa: E501
        :type brand_owner: str
        :param data_source: The data_source of this FoodUpdateLog.  # noqa: E501
        :type data_source: str
        :param data_type: The data_type of this FoodUpdateLog.  # noqa: E501
        :type data_type: str
        :param description: The description of this FoodUpdateLog.  # noqa: E501
        :type description: str
        :param food_class: The food_class of this FoodUpdateLog.  # noqa: E501
        :type food_class: str
        :param gtin_upc: The gtin_upc of this FoodUpdateLog.  # noqa: E501
        :type gtin_upc: str
        :param household_serving_full_text: The household_serving_full_text of this FoodUpdateLog.  # noqa: E501
        :type household_serving_full_text: str
        :param ingredients: The ingredients of this FoodUpdateLog.  # noqa: E501
        :type ingredients: str
        :param modified_date: The modified_date of this FoodUpdateLog.  # noqa: E501
        :type modified_date: str
        :param publication_date: The publication_date of this FoodUpdateLog.  # noqa: E501
        :type publication_date: str
        :param serving_size: The serving_size of this FoodUpdateLog.  # noqa: E501
        :type serving_size: int
        :param serving_size_unit: The serving_size_unit of this FoodUpdateLog.  # noqa: E501
        :type serving_size_unit: str
        :param branded_food_category: The branded_food_category of this FoodUpdateLog.  # noqa: E501
        :type branded_food_category: str
        :param changes: The changes of this FoodUpdateLog.  # noqa: E501
        :type changes: str
        :param food_attributes: The food_attributes of this FoodUpdateLog.  # noqa: E501
        :type food_attributes: List[FoodAttribute]
        """
        self.swagger_types = {
            'fdc_id': int,
            'available_date': str,
            'brand_owner': str,
            'data_source': str,
            'data_type': str,
            'description': str,
            'food_class': str,
            'gtin_upc': str,
            'household_serving_full_text': str,
            'ingredients': str,
            'modified_date': str,
            'publication_date': str,
            'serving_size': int,
            'serving_size_unit': str,
            'branded_food_category': str,
            'changes': str,
            'food_attributes': List[FoodAttribute]
        }

        self.attribute_map = {
            'fdc_id': 'fdcId',
            'available_date': 'availableDate',
            'brand_owner': 'brandOwner',
            'data_source': 'dataSource',
            'data_type': 'dataType',
            'description': 'description',
            'food_class': 'foodClass',
            'gtin_upc': 'gtinUpc',
            'household_serving_full_text': 'householdServingFullText',
            'ingredients': 'ingredients',
            'modified_date': 'modifiedDate',
            'publication_date': 'publicationDate',
            'serving_size': 'servingSize',
            'serving_size_unit': 'servingSizeUnit',
            'branded_food_category': 'brandedFoodCategory',
            'changes': 'changes',
            'food_attributes': 'foodAttributes'
        }
        self._fdc_id = fdc_id
        self._available_date = available_date
        self._brand_owner = brand_owner
        self._data_source = data_source
        self._data_type = data_type
        self._description = description
        self._food_class = food_class
        self._gtin_upc = gtin_upc
        self._household_serving_full_text = household_serving_full_text
        self._ingredients = ingredients
        self._modified_date = modified_date
        self._publication_date = publication_date
        self._serving_size = serving_size
        self._serving_size_unit = serving_size_unit
        self._branded_food_category = branded_food_category
        self._changes = changes
        self._food_attributes = food_attributes

    @classmethod
    def from_dict(cls, dikt) -> 'FoodUpdateLog':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The FoodUpdateLog of this FoodUpdateLog.  # noqa: E501
        :rtype: FoodUpdateLog
        """
        return util.deserialize_model(dikt, cls)

    @property
    def fdc_id(self) -> int:
        """Gets the fdc_id of this FoodUpdateLog.


        :return: The fdc_id of this FoodUpdateLog.
        :rtype: int
        """
        return self._fdc_id

    @fdc_id.setter
    def fdc_id(self, fdc_id: int):
        """Sets the fdc_id of this FoodUpdateLog.


        :param fdc_id: The fdc_id of this FoodUpdateLog.
        :type fdc_id: int
        """

        self._fdc_id = fdc_id

    @property
    def available_date(self) -> str:
        """Gets the available_date of this FoodUpdateLog.


        :return: The available_date of this FoodUpdateLog.
        :rtype: str
        """
        return self._available_date

    @available_date.setter
    def available_date(self, available_date: str):
        """Sets the available_date of this FoodUpdateLog.


        :param available_date: The available_date of this FoodUpdateLog.
        :type available_date: str
        """

        self._available_date = available_date

    @property
    def brand_owner(self) -> str:
        """Gets the brand_owner of this FoodUpdateLog.


        :return: The brand_owner of this FoodUpdateLog.
        :rtype: str
        """
        return self._brand_owner

    @brand_owner.setter
    def brand_owner(self, brand_owner: str):
        """Sets the brand_owner of this FoodUpdateLog.


        :param brand_owner: The brand_owner of this FoodUpdateLog.
        :type brand_owner: str
        """

        self._brand_owner = brand_owner

    @property
    def data_source(self) -> str:
        """Gets the data_source of this FoodUpdateLog.


        :return: The data_source of this FoodUpdateLog.
        :rtype: str
        """
        return self._data_source

    @data_source.setter
    def data_source(self, data_source: str):
        """Sets the data_source of this FoodUpdateLog.


        :param data_source: The data_source of this FoodUpdateLog.
        :type data_source: str
        """

        self._data_source = data_source

    @property
    def data_type(self) -> str:
        """Gets the data_type of this FoodUpdateLog.


        :return: The data_type of this FoodUpdateLog.
        :rtype: str
        """
        return self._data_type

    @data_type.setter
    def data_type(self, data_type: str):
        """Sets the data_type of this FoodUpdateLog.


        :param data_type: The data_type of this FoodUpdateLog.
        :type data_type: str
        """

        self._data_type = data_type

    @property
    def description(self) -> str:
        """Gets the description of this FoodUpdateLog.


        :return: The description of this FoodUpdateLog.
        :rtype: str
        """
        return self._description

    @description.setter
    def description(self, description: str):
        """Sets the description of this FoodUpdateLog.


        :param description: The description of this FoodUpdateLog.
        :type description: str
        """

        self._description = description

    @property
    def food_class(self) -> str:
        """Gets the food_class of this FoodUpdateLog.


        :return: The food_class of this FoodUpdateLog.
        :rtype: str
        """
        return self._food_class

    @food_class.setter
    def food_class(self, food_class: str):
        """Sets the food_class of this FoodUpdateLog.


        :param food_class: The food_class of this FoodUpdateLog.
        :type food_class: str
        """

        self._food_class = food_class

    @property
    def gtin_upc(self) -> str:
        """Gets the gtin_upc of this FoodUpdateLog.


        :return: The gtin_upc of this FoodUpdateLog.
        :rtype: str
        """
        return self._gtin_upc

    @gtin_upc.setter
    def gtin_upc(self, gtin_upc: str):
        """Sets the gtin_upc of this FoodUpdateLog.


        :param gtin_upc: The gtin_upc of this FoodUpdateLog.
        :type gtin_upc: str
        """

        self._gtin_upc = gtin_upc

    @property
    def household_serving_full_text(self) -> str:
        """Gets the household_serving_full_text of this FoodUpdateLog.


        :return: The household_serving_full_text of this FoodUpdateLog.
        :rtype: str
        """
        return self._household_serving_full_text

    @household_serving_full_text.setter
    def household_serving_full_text(self, household_serving_full_text: str):
        """Sets the household_serving_full_text of this FoodUpdateLog.


        :param household_serving_full_text: The household_serving_full_text of this FoodUpdateLog.
        :type household_serving_full_text: str
        """

        self._household_serving_full_text = household_serving_full_text

    @property
    def ingredients(self) -> str:
        """Gets the ingredients of this FoodUpdateLog.


        :return: The ingredients of this FoodUpdateLog.
        :rtype: str
        """
        return self._ingredients

    @ingredients.setter
    def ingredients(self, ingredients: str):
        """Sets the ingredients of this FoodUpdateLog.


        :param ingredients: The ingredients of this FoodUpdateLog.
        :type ingredients: str
        """

        self._ingredients = ingredients

    @property
    def modified_date(self) -> str:
        """Gets the modified_date of this FoodUpdateLog.


        :return: The modified_date of this FoodUpdateLog.
        :rtype: str
        """
        return self._modified_date

    @modified_date.setter
    def modified_date(self, modified_date: str):
        """Sets the modified_date of this FoodUpdateLog.


        :param modified_date: The modified_date of this FoodUpdateLog.
        :type modified_date: str
        """

        self._modified_date = modified_date

    @property
    def publication_date(self) -> str:
        """Gets the publication_date of this FoodUpdateLog.


        :return: The publication_date of this FoodUpdateLog.
        :rtype: str
        """
        return self._publication_date

    @publication_date.setter
    def publication_date(self, publication_date: str):
        """Sets the publication_date of this FoodUpdateLog.


        :param publication_date: The publication_date of this FoodUpdateLog.
        :type publication_date: str
        """

        self._publication_date = publication_date

    @property
    def serving_size(self) -> int:
        """Gets the serving_size of this FoodUpdateLog.


        :return: The serving_size of this FoodUpdateLog.
        :rtype: int
        """
        return self._serving_size

    @serving_size.setter
    def serving_size(self, serving_size: int):
        """Sets the serving_size of this FoodUpdateLog.


        :param serving_size: The serving_size of this FoodUpdateLog.
        :type serving_size: int
        """

        self._serving_size = serving_size

    @property
    def serving_size_unit(self) -> str:
        """Gets the serving_size_unit of this FoodUpdateLog.


        :return: The serving_size_unit of this FoodUpdateLog.
        :rtype: str
        """
        return self._serving_size_unit

    @serving_size_unit.setter
    def serving_size_unit(self, serving_size_unit: str):
        """Sets the serving_size_unit of this FoodUpdateLog.


        :param serving_size_unit: The serving_size_unit of this FoodUpdateLog.
        :type serving_size_unit: str
        """

        self._serving_size_unit = serving_size_unit

    @property
    def branded_food_category(self) -> str:
        """Gets the branded_food_category of this FoodUpdateLog.


        :return: The branded_food_category of this FoodUpdateLog.
        :rtype: str
        """
        return self._branded_food_category

    @branded_food_category.setter
    def branded_food_category(self, branded_food_category: str):
        """Sets the branded_food_category of this FoodUpdateLog.


        :param branded_food_category: The branded_food_category of this FoodUpdateLog.
        :type branded_food_category: str
        """

        self._branded_food_category = branded_food_category

    @property
    def changes(self) -> str:
        """Gets the changes of this FoodUpdateLog.


        :return: The changes of this FoodUpdateLog.
        :rtype: str
        """
        return self._changes

    @changes.setter
    def changes(self, changes: str):
        """Sets the changes of this FoodUpdateLog.


        :param changes: The changes of this FoodUpdateLog.
        :type changes: str
        """

        self._changes = changes

    @property
    def food_attributes(self) -> List[FoodAttribute]:
        """Gets the food_attributes of this FoodUpdateLog.


        :return: The food_attributes of this FoodUpdateLog.
        :rtype: List[FoodAttribute]
        """
        return self._food_attributes

    @food_attributes.setter
    def food_attributes(self, food_attributes: List[FoodAttribute]):
        """Sets the food_attributes of this FoodUpdateLog.


        :param food_attributes: The food_attributes of this FoodUpdateLog.
        :type food_attributes: List[FoodAttribute]
        """

        self._food_attributes = food_attributes
