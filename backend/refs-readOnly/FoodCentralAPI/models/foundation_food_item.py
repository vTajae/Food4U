# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI.models.food_category import FoodCategory  # noqa: F401,E501
from FoodCentralAPI.models.food_component import FoodComponent  # noqa: F401,E501
from FoodCentralAPI.models.food_nutrient import FoodNutrient  # noqa: F401,E501
from FoodCentralAPI.models.food_portion import FoodPortion  # noqa: F401,E501
from FoodCentralAPI.models.input_food_foundation import InputFoodFoundation  # noqa: F401,E501
from FoodCentralAPI.models.nutrient_conversion_factors import NutrientConversionFactors  # noqa: F401,E501
from FoodCentralAPI import util


class FoundationFoodItem(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, fdc_id: int=None, data_type: str=None, description: str=None, food_class: str=None, foot_note: str=None, is_historical_reference: bool=None, ndb_number: int=None, publication_date: str=None, scientific_name: str=None, food_category: FoodCategory=None, food_components: List[FoodComponent]=None, food_nutrients: List[FoodNutrient]=None, food_portions: List[FoodPortion]=None, input_foods: List[InputFoodFoundation]=None, nutrient_conversion_factors: List[NutrientConversionFactors]=None):  # noqa: E501
        """FoundationFoodItem - a model defined in Swagger

        :param fdc_id: The fdc_id of this FoundationFoodItem.  # noqa: E501
        :type fdc_id: int
        :param data_type: The data_type of this FoundationFoodItem.  # noqa: E501
        :type data_type: str
        :param description: The description of this FoundationFoodItem.  # noqa: E501
        :type description: str
        :param food_class: The food_class of this FoundationFoodItem.  # noqa: E501
        :type food_class: str
        :param foot_note: The foot_note of this FoundationFoodItem.  # noqa: E501
        :type foot_note: str
        :param is_historical_reference: The is_historical_reference of this FoundationFoodItem.  # noqa: E501
        :type is_historical_reference: bool
        :param ndb_number: The ndb_number of this FoundationFoodItem.  # noqa: E501
        :type ndb_number: int
        :param publication_date: The publication_date of this FoundationFoodItem.  # noqa: E501
        :type publication_date: str
        :param scientific_name: The scientific_name of this FoundationFoodItem.  # noqa: E501
        :type scientific_name: str
        :param food_category: The food_category of this FoundationFoodItem.  # noqa: E501
        :type food_category: FoodCategory
        :param food_components: The food_components of this FoundationFoodItem.  # noqa: E501
        :type food_components: List[FoodComponent]
        :param food_nutrients: The food_nutrients of this FoundationFoodItem.  # noqa: E501
        :type food_nutrients: List[FoodNutrient]
        :param food_portions: The food_portions of this FoundationFoodItem.  # noqa: E501
        :type food_portions: List[FoodPortion]
        :param input_foods: The input_foods of this FoundationFoodItem.  # noqa: E501
        :type input_foods: List[InputFoodFoundation]
        :param nutrient_conversion_factors: The nutrient_conversion_factors of this FoundationFoodItem.  # noqa: E501
        :type nutrient_conversion_factors: List[NutrientConversionFactors]
        """
        self.swagger_types = {
            'fdc_id': int,
            'data_type': str,
            'description': str,
            'food_class': str,
            'foot_note': str,
            'is_historical_reference': bool,
            'ndb_number': int,
            'publication_date': str,
            'scientific_name': str,
            'food_category': FoodCategory,
            'food_components': List[FoodComponent],
            'food_nutrients': List[FoodNutrient],
            'food_portions': List[FoodPortion],
            'input_foods': List[InputFoodFoundation],
            'nutrient_conversion_factors': List[NutrientConversionFactors]
        }

        self.attribute_map = {
            'fdc_id': 'fdcId',
            'data_type': 'dataType',
            'description': 'description',
            'food_class': 'foodClass',
            'foot_note': 'footNote',
            'is_historical_reference': 'isHistoricalReference',
            'ndb_number': 'ndbNumber',
            'publication_date': 'publicationDate',
            'scientific_name': 'scientificName',
            'food_category': 'foodCategory',
            'food_components': 'foodComponents',
            'food_nutrients': 'foodNutrients',
            'food_portions': 'foodPortions',
            'input_foods': 'inputFoods',
            'nutrient_conversion_factors': 'nutrientConversionFactors'
        }
        self._fdc_id = fdc_id
        self._data_type = data_type
        self._description = description
        self._food_class = food_class
        self._foot_note = foot_note
        self._is_historical_reference = is_historical_reference
        self._ndb_number = ndb_number
        self._publication_date = publication_date
        self._scientific_name = scientific_name
        self._food_category = food_category
        self._food_components = food_components
        self._food_nutrients = food_nutrients
        self._food_portions = food_portions
        self._input_foods = input_foods
        self._nutrient_conversion_factors = nutrient_conversion_factors

    @classmethod
    def from_dict(cls, dikt) -> 'FoundationFoodItem':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The FoundationFoodItem of this FoundationFoodItem.  # noqa: E501
        :rtype: FoundationFoodItem
        """
        return util.deserialize_model(dikt, cls)

    @property
    def fdc_id(self) -> int:
        """Gets the fdc_id of this FoundationFoodItem.


        :return: The fdc_id of this FoundationFoodItem.
        :rtype: int
        """
        return self._fdc_id

    @fdc_id.setter
    def fdc_id(self, fdc_id: int):
        """Sets the fdc_id of this FoundationFoodItem.


        :param fdc_id: The fdc_id of this FoundationFoodItem.
        :type fdc_id: int
        """
        if fdc_id is None:
            raise ValueError("Invalid value for `fdc_id`, must not be `None`")  # noqa: E501

        self._fdc_id = fdc_id

    @property
    def data_type(self) -> str:
        """Gets the data_type of this FoundationFoodItem.


        :return: The data_type of this FoundationFoodItem.
        :rtype: str
        """
        return self._data_type

    @data_type.setter
    def data_type(self, data_type: str):
        """Sets the data_type of this FoundationFoodItem.


        :param data_type: The data_type of this FoundationFoodItem.
        :type data_type: str
        """
        if data_type is None:
            raise ValueError("Invalid value for `data_type`, must not be `None`")  # noqa: E501

        self._data_type = data_type

    @property
    def description(self) -> str:
        """Gets the description of this FoundationFoodItem.


        :return: The description of this FoundationFoodItem.
        :rtype: str
        """
        return self._description

    @description.setter
    def description(self, description: str):
        """Sets the description of this FoundationFoodItem.


        :param description: The description of this FoundationFoodItem.
        :type description: str
        """
        if description is None:
            raise ValueError("Invalid value for `description`, must not be `None`")  # noqa: E501

        self._description = description

    @property
    def food_class(self) -> str:
        """Gets the food_class of this FoundationFoodItem.


        :return: The food_class of this FoundationFoodItem.
        :rtype: str
        """
        return self._food_class

    @food_class.setter
    def food_class(self, food_class: str):
        """Sets the food_class of this FoundationFoodItem.


        :param food_class: The food_class of this FoundationFoodItem.
        :type food_class: str
        """

        self._food_class = food_class

    @property
    def foot_note(self) -> str:
        """Gets the foot_note of this FoundationFoodItem.


        :return: The foot_note of this FoundationFoodItem.
        :rtype: str
        """
        return self._foot_note

    @foot_note.setter
    def foot_note(self, foot_note: str):
        """Sets the foot_note of this FoundationFoodItem.


        :param foot_note: The foot_note of this FoundationFoodItem.
        :type foot_note: str
        """

        self._foot_note = foot_note

    @property
    def is_historical_reference(self) -> bool:
        """Gets the is_historical_reference of this FoundationFoodItem.


        :return: The is_historical_reference of this FoundationFoodItem.
        :rtype: bool
        """
        return self._is_historical_reference

    @is_historical_reference.setter
    def is_historical_reference(self, is_historical_reference: bool):
        """Sets the is_historical_reference of this FoundationFoodItem.


        :param is_historical_reference: The is_historical_reference of this FoundationFoodItem.
        :type is_historical_reference: bool
        """

        self._is_historical_reference = is_historical_reference

    @property
    def ndb_number(self) -> int:
        """Gets the ndb_number of this FoundationFoodItem.


        :return: The ndb_number of this FoundationFoodItem.
        :rtype: int
        """
        return self._ndb_number

    @ndb_number.setter
    def ndb_number(self, ndb_number: int):
        """Sets the ndb_number of this FoundationFoodItem.


        :param ndb_number: The ndb_number of this FoundationFoodItem.
        :type ndb_number: int
        """

        self._ndb_number = ndb_number

    @property
    def publication_date(self) -> str:
        """Gets the publication_date of this FoundationFoodItem.


        :return: The publication_date of this FoundationFoodItem.
        :rtype: str
        """
        return self._publication_date

    @publication_date.setter
    def publication_date(self, publication_date: str):
        """Sets the publication_date of this FoundationFoodItem.


        :param publication_date: The publication_date of this FoundationFoodItem.
        :type publication_date: str
        """

        self._publication_date = publication_date

    @property
    def scientific_name(self) -> str:
        """Gets the scientific_name of this FoundationFoodItem.


        :return: The scientific_name of this FoundationFoodItem.
        :rtype: str
        """
        return self._scientific_name

    @scientific_name.setter
    def scientific_name(self, scientific_name: str):
        """Sets the scientific_name of this FoundationFoodItem.


        :param scientific_name: The scientific_name of this FoundationFoodItem.
        :type scientific_name: str
        """

        self._scientific_name = scientific_name

    @property
    def food_category(self) -> FoodCategory:
        """Gets the food_category of this FoundationFoodItem.


        :return: The food_category of this FoundationFoodItem.
        :rtype: FoodCategory
        """
        return self._food_category

    @food_category.setter
    def food_category(self, food_category: FoodCategory):
        """Sets the food_category of this FoundationFoodItem.


        :param food_category: The food_category of this FoundationFoodItem.
        :type food_category: FoodCategory
        """

        self._food_category = food_category

    @property
    def food_components(self) -> List[FoodComponent]:
        """Gets the food_components of this FoundationFoodItem.


        :return: The food_components of this FoundationFoodItem.
        :rtype: List[FoodComponent]
        """
        return self._food_components

    @food_components.setter
    def food_components(self, food_components: List[FoodComponent]):
        """Sets the food_components of this FoundationFoodItem.


        :param food_components: The food_components of this FoundationFoodItem.
        :type food_components: List[FoodComponent]
        """

        self._food_components = food_components

    @property
    def food_nutrients(self) -> List[FoodNutrient]:
        """Gets the food_nutrients of this FoundationFoodItem.


        :return: The food_nutrients of this FoundationFoodItem.
        :rtype: List[FoodNutrient]
        """
        return self._food_nutrients

    @food_nutrients.setter
    def food_nutrients(self, food_nutrients: List[FoodNutrient]):
        """Sets the food_nutrients of this FoundationFoodItem.


        :param food_nutrients: The food_nutrients of this FoundationFoodItem.
        :type food_nutrients: List[FoodNutrient]
        """

        self._food_nutrients = food_nutrients

    @property
    def food_portions(self) -> List[FoodPortion]:
        """Gets the food_portions of this FoundationFoodItem.


        :return: The food_portions of this FoundationFoodItem.
        :rtype: List[FoodPortion]
        """
        return self._food_portions

    @food_portions.setter
    def food_portions(self, food_portions: List[FoodPortion]):
        """Sets the food_portions of this FoundationFoodItem.


        :param food_portions: The food_portions of this FoundationFoodItem.
        :type food_portions: List[FoodPortion]
        """

        self._food_portions = food_portions

    @property
    def input_foods(self) -> List[InputFoodFoundation]:
        """Gets the input_foods of this FoundationFoodItem.


        :return: The input_foods of this FoundationFoodItem.
        :rtype: List[InputFoodFoundation]
        """
        return self._input_foods

    @input_foods.setter
    def input_foods(self, input_foods: List[InputFoodFoundation]):
        """Sets the input_foods of this FoundationFoodItem.


        :param input_foods: The input_foods of this FoundationFoodItem.
        :type input_foods: List[InputFoodFoundation]
        """

        self._input_foods = input_foods

    @property
    def nutrient_conversion_factors(self) -> List[NutrientConversionFactors]:
        """Gets the nutrient_conversion_factors of this FoundationFoodItem.


        :return: The nutrient_conversion_factors of this FoundationFoodItem.
        :rtype: List[NutrientConversionFactors]
        """
        return self._nutrient_conversion_factors

    @nutrient_conversion_factors.setter
    def nutrient_conversion_factors(self, nutrient_conversion_factors: List[NutrientConversionFactors]):
        """Sets the nutrient_conversion_factors of this FoundationFoodItem.


        :param nutrient_conversion_factors: The nutrient_conversion_factors of this FoundationFoodItem.
        :type nutrient_conversion_factors: List[NutrientConversionFactors]
        """

        self._nutrient_conversion_factors = nutrient_conversion_factors
