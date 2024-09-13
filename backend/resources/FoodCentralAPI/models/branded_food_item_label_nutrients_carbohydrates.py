# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI import util


class BrandedFoodItemLabelNutrientsCarbohydrates(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, value: float=None):  # noqa: E501
        """BrandedFoodItemLabelNutrientsCarbohydrates - a model defined in Swagger

        :param value: The value of this BrandedFoodItemLabelNutrientsCarbohydrates.  # noqa: E501
        :type value: float
        """
        self.swagger_types = {
            'value': float
        }

        self.attribute_map = {
            'value': 'value'
        }
        self._value = value

    @classmethod
    def from_dict(cls, dikt) -> 'BrandedFoodItemLabelNutrientsCarbohydrates':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The BrandedFoodItem_labelNutrients_carbohydrates of this BrandedFoodItemLabelNutrientsCarbohydrates.  # noqa: E501
        :rtype: BrandedFoodItemLabelNutrientsCarbohydrates
        """
        return util.deserialize_model(dikt, cls)

    @property
    def value(self) -> float:
        """Gets the value of this BrandedFoodItemLabelNutrientsCarbohydrates.


        :return: The value of this BrandedFoodItemLabelNutrientsCarbohydrates.
        :rtype: float
        """
        return self._value

    @value.setter
    def value(self, value: float):
        """Sets the value of this BrandedFoodItemLabelNutrientsCarbohydrates.


        :param value: The value of this BrandedFoodItemLabelNutrientsCarbohydrates.
        :type value: float
        """

        self._value = value
