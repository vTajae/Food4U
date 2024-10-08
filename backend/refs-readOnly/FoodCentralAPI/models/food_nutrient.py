# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI.models.food_nutrient_derivation import FoodNutrientDerivation  # noqa: F401,E501
from FoodCentralAPI.models.nutrient import Nutrient  # noqa: F401,E501
from FoodCentralAPI.models.nutrient_analysis_details import NutrientAnalysisDetails  # noqa: F401,E501
from FoodCentralAPI import util


class FoodNutrient(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, id: int=None, amount: float=None, data_points: int=None, min: float=None, max: float=None, median: float=None, type: str=None, nutrient: Nutrient=None, food_nutrient_derivation: FoodNutrientDerivation=None, nutrient_analysis_details: NutrientAnalysisDetails=None):  # noqa: E501
        """FoodNutrient - a model defined in Swagger

        :param id: The id of this FoodNutrient.  # noqa: E501
        :type id: int
        :param amount: The amount of this FoodNutrient.  # noqa: E501
        :type amount: float
        :param data_points: The data_points of this FoodNutrient.  # noqa: E501
        :type data_points: int
        :param min: The min of this FoodNutrient.  # noqa: E501
        :type min: float
        :param max: The max of this FoodNutrient.  # noqa: E501
        :type max: float
        :param median: The median of this FoodNutrient.  # noqa: E501
        :type median: float
        :param type: The type of this FoodNutrient.  # noqa: E501
        :type type: str
        :param nutrient: The nutrient of this FoodNutrient.  # noqa: E501
        :type nutrient: Nutrient
        :param food_nutrient_derivation: The food_nutrient_derivation of this FoodNutrient.  # noqa: E501
        :type food_nutrient_derivation: FoodNutrientDerivation
        :param nutrient_analysis_details: The nutrient_analysis_details of this FoodNutrient.  # noqa: E501
        :type nutrient_analysis_details: NutrientAnalysisDetails
        """
        self.swagger_types = {
            'id': int,
            'amount': float,
            'data_points': int,
            'min': float,
            'max': float,
            'median': float,
            'type': str,
            'nutrient': Nutrient,
            'food_nutrient_derivation': FoodNutrientDerivation,
            'nutrient_analysis_details': NutrientAnalysisDetails
        }

        self.attribute_map = {
            'id': 'id',
            'amount': 'amount',
            'data_points': 'dataPoints',
            'min': 'min',
            'max': 'max',
            'median': 'median',
            'type': 'type',
            'nutrient': 'nutrient',
            'food_nutrient_derivation': 'foodNutrientDerivation',
            'nutrient_analysis_details': 'nutrientAnalysisDetails'
        }
        self._id = id
        self._amount = amount
        self._data_points = data_points
        self._min = min
        self._max = max
        self._median = median
        self._type = type
        self._nutrient = nutrient
        self._food_nutrient_derivation = food_nutrient_derivation
        self._nutrient_analysis_details = nutrient_analysis_details

    @classmethod
    def from_dict(cls, dikt) -> 'FoodNutrient':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The FoodNutrient of this FoodNutrient.  # noqa: E501
        :rtype: FoodNutrient
        """
        return util.deserialize_model(dikt, cls)

    @property
    def id(self) -> int:
        """Gets the id of this FoodNutrient.


        :return: The id of this FoodNutrient.
        :rtype: int
        """
        return self._id

    @id.setter
    def id(self, id: int):
        """Sets the id of this FoodNutrient.


        :param id: The id of this FoodNutrient.
        :type id: int
        """
        if id is None:
            raise ValueError("Invalid value for `id`, must not be `None`")  # noqa: E501

        self._id = id

    @property
    def amount(self) -> float:
        """Gets the amount of this FoodNutrient.


        :return: The amount of this FoodNutrient.
        :rtype: float
        """
        return self._amount

    @amount.setter
    def amount(self, amount: float):
        """Sets the amount of this FoodNutrient.


        :param amount: The amount of this FoodNutrient.
        :type amount: float
        """

        self._amount = amount

    @property
    def data_points(self) -> int:
        """Gets the data_points of this FoodNutrient.


        :return: The data_points of this FoodNutrient.
        :rtype: int
        """
        return self._data_points

    @data_points.setter
    def data_points(self, data_points: int):
        """Sets the data_points of this FoodNutrient.


        :param data_points: The data_points of this FoodNutrient.
        :type data_points: int
        """

        self._data_points = data_points

    @property
    def min(self) -> float:
        """Gets the min of this FoodNutrient.


        :return: The min of this FoodNutrient.
        :rtype: float
        """
        return self._min

    @min.setter
    def min(self, min: float):
        """Sets the min of this FoodNutrient.


        :param min: The min of this FoodNutrient.
        :type min: float
        """

        self._min = min

    @property
    def max(self) -> float:
        """Gets the max of this FoodNutrient.


        :return: The max of this FoodNutrient.
        :rtype: float
        """
        return self._max

    @max.setter
    def max(self, max: float):
        """Sets the max of this FoodNutrient.


        :param max: The max of this FoodNutrient.
        :type max: float
        """

        self._max = max

    @property
    def median(self) -> float:
        """Gets the median of this FoodNutrient.


        :return: The median of this FoodNutrient.
        :rtype: float
        """
        return self._median

    @median.setter
    def median(self, median: float):
        """Sets the median of this FoodNutrient.


        :param median: The median of this FoodNutrient.
        :type median: float
        """

        self._median = median

    @property
    def type(self) -> str:
        """Gets the type of this FoodNutrient.


        :return: The type of this FoodNutrient.
        :rtype: str
        """
        return self._type

    @type.setter
    def type(self, type: str):
        """Sets the type of this FoodNutrient.


        :param type: The type of this FoodNutrient.
        :type type: str
        """

        self._type = type

    @property
    def nutrient(self) -> Nutrient:
        """Gets the nutrient of this FoodNutrient.


        :return: The nutrient of this FoodNutrient.
        :rtype: Nutrient
        """
        return self._nutrient

    @nutrient.setter
    def nutrient(self, nutrient: Nutrient):
        """Sets the nutrient of this FoodNutrient.


        :param nutrient: The nutrient of this FoodNutrient.
        :type nutrient: Nutrient
        """

        self._nutrient = nutrient

    @property
    def food_nutrient_derivation(self) -> FoodNutrientDerivation:
        """Gets the food_nutrient_derivation of this FoodNutrient.


        :return: The food_nutrient_derivation of this FoodNutrient.
        :rtype: FoodNutrientDerivation
        """
        return self._food_nutrient_derivation

    @food_nutrient_derivation.setter
    def food_nutrient_derivation(self, food_nutrient_derivation: FoodNutrientDerivation):
        """Sets the food_nutrient_derivation of this FoodNutrient.


        :param food_nutrient_derivation: The food_nutrient_derivation of this FoodNutrient.
        :type food_nutrient_derivation: FoodNutrientDerivation
        """

        self._food_nutrient_derivation = food_nutrient_derivation

    @property
    def nutrient_analysis_details(self) -> NutrientAnalysisDetails:
        """Gets the nutrient_analysis_details of this FoodNutrient.


        :return: The nutrient_analysis_details of this FoodNutrient.
        :rtype: NutrientAnalysisDetails
        """
        return self._nutrient_analysis_details

    @nutrient_analysis_details.setter
    def nutrient_analysis_details(self, nutrient_analysis_details: NutrientAnalysisDetails):
        """Sets the nutrient_analysis_details of this FoodNutrient.


        :param nutrient_analysis_details: The nutrient_analysis_details of this FoodNutrient.
        :type nutrient_analysis_details: NutrientAnalysisDetails
        """

        self._nutrient_analysis_details = nutrient_analysis_details
