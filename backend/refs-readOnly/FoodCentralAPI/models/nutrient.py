# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI import util


class Nutrient(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, id: int=None, number: str=None, name: str=None, rank: int=None, unit_name: str=None):  # noqa: E501
        """Nutrient - a model defined in Swagger

        :param id: The id of this Nutrient.  # noqa: E501
        :type id: int
        :param number: The number of this Nutrient.  # noqa: E501
        :type number: str
        :param name: The name of this Nutrient.  # noqa: E501
        :type name: str
        :param rank: The rank of this Nutrient.  # noqa: E501
        :type rank: int
        :param unit_name: The unit_name of this Nutrient.  # noqa: E501
        :type unit_name: str
        """
        self.swagger_types = {
            'id': int,
            'number': str,
            'name': str,
            'rank': int,
            'unit_name': str
        }

        self.attribute_map = {
            'id': 'id',
            'number': 'number',
            'name': 'name',
            'rank': 'rank',
            'unit_name': 'unitName'
        }
        self._id = id
        self._number = number
        self._name = name
        self._rank = rank
        self._unit_name = unit_name

    @classmethod
    def from_dict(cls, dikt) -> 'Nutrient':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The Nutrient of this Nutrient.  # noqa: E501
        :rtype: Nutrient
        """
        return util.deserialize_model(dikt, cls)

    @property
    def id(self) -> int:
        """Gets the id of this Nutrient.


        :return: The id of this Nutrient.
        :rtype: int
        """
        return self._id

    @id.setter
    def id(self, id: int):
        """Sets the id of this Nutrient.


        :param id: The id of this Nutrient.
        :type id: int
        """

        self._id = id

    @property
    def number(self) -> str:
        """Gets the number of this Nutrient.


        :return: The number of this Nutrient.
        :rtype: str
        """
        return self._number

    @number.setter
    def number(self, number: str):
        """Sets the number of this Nutrient.


        :param number: The number of this Nutrient.
        :type number: str
        """

        self._number = number

    @property
    def name(self) -> str:
        """Gets the name of this Nutrient.


        :return: The name of this Nutrient.
        :rtype: str
        """
        return self._name

    @name.setter
    def name(self, name: str):
        """Sets the name of this Nutrient.


        :param name: The name of this Nutrient.
        :type name: str
        """

        self._name = name

    @property
    def rank(self) -> int:
        """Gets the rank of this Nutrient.


        :return: The rank of this Nutrient.
        :rtype: int
        """
        return self._rank

    @rank.setter
    def rank(self, rank: int):
        """Sets the rank of this Nutrient.


        :param rank: The rank of this Nutrient.
        :type rank: int
        """

        self._rank = rank

    @property
    def unit_name(self) -> str:
        """Gets the unit_name of this Nutrient.


        :return: The unit_name of this Nutrient.
        :rtype: str
        """
        return self._unit_name

    @unit_name.setter
    def unit_name(self, unit_name: str):
        """Sets the unit_name of this Nutrient.


        :param unit_name: The unit_name of this Nutrient.
        :type unit_name: str
        """

        self._unit_name = unit_name
