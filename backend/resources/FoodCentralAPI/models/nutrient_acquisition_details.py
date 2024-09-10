# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI import util


class NutrientAcquisitionDetails(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, sample_unit_id: int=None, purchase_date: str=None, store_city: str=None, store_state: str=None):  # noqa: E501
        """NutrientAcquisitionDetails - a model defined in Swagger

        :param sample_unit_id: The sample_unit_id of this NutrientAcquisitionDetails.  # noqa: E501
        :type sample_unit_id: int
        :param purchase_date: The purchase_date of this NutrientAcquisitionDetails.  # noqa: E501
        :type purchase_date: str
        :param store_city: The store_city of this NutrientAcquisitionDetails.  # noqa: E501
        :type store_city: str
        :param store_state: The store_state of this NutrientAcquisitionDetails.  # noqa: E501
        :type store_state: str
        """
        self.swagger_types = {
            'sample_unit_id': int,
            'purchase_date': str,
            'store_city': str,
            'store_state': str
        }

        self.attribute_map = {
            'sample_unit_id': 'sampleUnitId',
            'purchase_date': 'purchaseDate',
            'store_city': 'storeCity',
            'store_state': 'storeState'
        }
        self._sample_unit_id = sample_unit_id
        self._purchase_date = purchase_date
        self._store_city = store_city
        self._store_state = store_state

    @classmethod
    def from_dict(cls, dikt) -> 'NutrientAcquisitionDetails':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The NutrientAcquisitionDetails of this NutrientAcquisitionDetails.  # noqa: E501
        :rtype: NutrientAcquisitionDetails
        """
        return util.deserialize_model(dikt, cls)

    @property
    def sample_unit_id(self) -> int:
        """Gets the sample_unit_id of this NutrientAcquisitionDetails.


        :return: The sample_unit_id of this NutrientAcquisitionDetails.
        :rtype: int
        """
        return self._sample_unit_id

    @sample_unit_id.setter
    def sample_unit_id(self, sample_unit_id: int):
        """Sets the sample_unit_id of this NutrientAcquisitionDetails.


        :param sample_unit_id: The sample_unit_id of this NutrientAcquisitionDetails.
        :type sample_unit_id: int
        """

        self._sample_unit_id = sample_unit_id

    @property
    def purchase_date(self) -> str:
        """Gets the purchase_date of this NutrientAcquisitionDetails.


        :return: The purchase_date of this NutrientAcquisitionDetails.
        :rtype: str
        """
        return self._purchase_date

    @purchase_date.setter
    def purchase_date(self, purchase_date: str):
        """Sets the purchase_date of this NutrientAcquisitionDetails.


        :param purchase_date: The purchase_date of this NutrientAcquisitionDetails.
        :type purchase_date: str
        """

        self._purchase_date = purchase_date

    @property
    def store_city(self) -> str:
        """Gets the store_city of this NutrientAcquisitionDetails.


        :return: The store_city of this NutrientAcquisitionDetails.
        :rtype: str
        """
        return self._store_city

    @store_city.setter
    def store_city(self, store_city: str):
        """Sets the store_city of this NutrientAcquisitionDetails.


        :param store_city: The store_city of this NutrientAcquisitionDetails.
        :type store_city: str
        """

        self._store_city = store_city

    @property
    def store_state(self) -> str:
        """Gets the store_state of this NutrientAcquisitionDetails.


        :return: The store_state of this NutrientAcquisitionDetails.
        :rtype: str
        """
        return self._store_state

    @store_state.setter
    def store_state(self, store_state: str):
        """Sets the store_state of this NutrientAcquisitionDetails.


        :param store_state: The store_state of this NutrientAcquisitionDetails.
        :type store_state: str
        """

        self._store_state = store_state
