# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI import util


class MeasureUnit(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, id: int=None, abbreviation: str=None, name: str=None):  # noqa: E501
        """MeasureUnit - a model defined in Swagger

        :param id: The id of this MeasureUnit.  # noqa: E501
        :type id: int
        :param abbreviation: The abbreviation of this MeasureUnit.  # noqa: E501
        :type abbreviation: str
        :param name: The name of this MeasureUnit.  # noqa: E501
        :type name: str
        """
        self.swagger_types = {
            'id': int,
            'abbreviation': str,
            'name': str
        }

        self.attribute_map = {
            'id': 'id',
            'abbreviation': 'abbreviation',
            'name': 'name'
        }
        self._id = id
        self._abbreviation = abbreviation
        self._name = name

    @classmethod
    def from_dict(cls, dikt) -> 'MeasureUnit':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The MeasureUnit of this MeasureUnit.  # noqa: E501
        :rtype: MeasureUnit
        """
        return util.deserialize_model(dikt, cls)

    @property
    def id(self) -> int:
        """Gets the id of this MeasureUnit.


        :return: The id of this MeasureUnit.
        :rtype: int
        """
        return self._id

    @id.setter
    def id(self, id: int):
        """Sets the id of this MeasureUnit.


        :param id: The id of this MeasureUnit.
        :type id: int
        """

        self._id = id

    @property
    def abbreviation(self) -> str:
        """Gets the abbreviation of this MeasureUnit.


        :return: The abbreviation of this MeasureUnit.
        :rtype: str
        """
        return self._abbreviation

    @abbreviation.setter
    def abbreviation(self, abbreviation: str):
        """Sets the abbreviation of this MeasureUnit.


        :param abbreviation: The abbreviation of this MeasureUnit.
        :type abbreviation: str
        """

        self._abbreviation = abbreviation

    @property
    def name(self) -> str:
        """Gets the name of this MeasureUnit.


        :return: The name of this MeasureUnit.
        :rtype: str
        """
        return self._name

    @name.setter
    def name(self, name: str):
        """Sets the name of this MeasureUnit.


        :param name: The name of this MeasureUnit.
        :type name: str
        """

        self._name = name
