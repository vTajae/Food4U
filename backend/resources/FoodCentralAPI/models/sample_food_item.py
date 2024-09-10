# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI.models.food_category import FoodCategory  # noqa: F401,E501
from FoodCentralAPI import util


class SampleFoodItem(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, fdc_id: int=None, datatype: str=None, description: str=None, food_class: str=None, publication_date: str=None, food_attributes: List[FoodCategory]=None):  # noqa: E501
        """SampleFoodItem - a model defined in Swagger

        :param fdc_id: The fdc_id of this SampleFoodItem.  # noqa: E501
        :type fdc_id: int
        :param datatype: The datatype of this SampleFoodItem.  # noqa: E501
        :type datatype: str
        :param description: The description of this SampleFoodItem.  # noqa: E501
        :type description: str
        :param food_class: The food_class of this SampleFoodItem.  # noqa: E501
        :type food_class: str
        :param publication_date: The publication_date of this SampleFoodItem.  # noqa: E501
        :type publication_date: str
        :param food_attributes: The food_attributes of this SampleFoodItem.  # noqa: E501
        :type food_attributes: List[FoodCategory]
        """
        self.swagger_types = {
            'fdc_id': int,
            'datatype': str,
            'description': str,
            'food_class': str,
            'publication_date': str,
            'food_attributes': List[FoodCategory]
        }

        self.attribute_map = {
            'fdc_id': 'fdcId',
            'datatype': 'datatype',
            'description': 'description',
            'food_class': 'foodClass',
            'publication_date': 'publicationDate',
            'food_attributes': 'foodAttributes'
        }
        self._fdc_id = fdc_id
        self._datatype = datatype
        self._description = description
        self._food_class = food_class
        self._publication_date = publication_date
        self._food_attributes = food_attributes

    @classmethod
    def from_dict(cls, dikt) -> 'SampleFoodItem':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The SampleFoodItem of this SampleFoodItem.  # noqa: E501
        :rtype: SampleFoodItem
        """
        return util.deserialize_model(dikt, cls)

    @property
    def fdc_id(self) -> int:
        """Gets the fdc_id of this SampleFoodItem.


        :return: The fdc_id of this SampleFoodItem.
        :rtype: int
        """
        return self._fdc_id

    @fdc_id.setter
    def fdc_id(self, fdc_id: int):
        """Sets the fdc_id of this SampleFoodItem.


        :param fdc_id: The fdc_id of this SampleFoodItem.
        :type fdc_id: int
        """
        if fdc_id is None:
            raise ValueError("Invalid value for `fdc_id`, must not be `None`")  # noqa: E501

        self._fdc_id = fdc_id

    @property
    def datatype(self) -> str:
        """Gets the datatype of this SampleFoodItem.


        :return: The datatype of this SampleFoodItem.
        :rtype: str
        """
        return self._datatype

    @datatype.setter
    def datatype(self, datatype: str):
        """Sets the datatype of this SampleFoodItem.


        :param datatype: The datatype of this SampleFoodItem.
        :type datatype: str
        """

        self._datatype = datatype

    @property
    def description(self) -> str:
        """Gets the description of this SampleFoodItem.


        :return: The description of this SampleFoodItem.
        :rtype: str
        """
        return self._description

    @description.setter
    def description(self, description: str):
        """Sets the description of this SampleFoodItem.


        :param description: The description of this SampleFoodItem.
        :type description: str
        """
        if description is None:
            raise ValueError("Invalid value for `description`, must not be `None`")  # noqa: E501

        self._description = description

    @property
    def food_class(self) -> str:
        """Gets the food_class of this SampleFoodItem.


        :return: The food_class of this SampleFoodItem.
        :rtype: str
        """
        return self._food_class

    @food_class.setter
    def food_class(self, food_class: str):
        """Sets the food_class of this SampleFoodItem.


        :param food_class: The food_class of this SampleFoodItem.
        :type food_class: str
        """

        self._food_class = food_class

    @property
    def publication_date(self) -> str:
        """Gets the publication_date of this SampleFoodItem.


        :return: The publication_date of this SampleFoodItem.
        :rtype: str
        """
        return self._publication_date

    @publication_date.setter
    def publication_date(self, publication_date: str):
        """Sets the publication_date of this SampleFoodItem.


        :param publication_date: The publication_date of this SampleFoodItem.
        :type publication_date: str
        """

        self._publication_date = publication_date

    @property
    def food_attributes(self) -> List[FoodCategory]:
        """Gets the food_attributes of this SampleFoodItem.


        :return: The food_attributes of this SampleFoodItem.
        :rtype: List[FoodCategory]
        """
        return self._food_attributes

    @food_attributes.setter
    def food_attributes(self, food_attributes: List[FoodCategory]):
        """Sets the food_attributes of this SampleFoodItem.


        :param food_attributes: The food_attributes of this SampleFoodItem.
        :type food_attributes: List[FoodCategory]
        """

        self._food_attributes = food_attributes
