# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from FoodCentralAPI.models.base_model_ import Model
from FoodCentralAPI.models.branded_food_item_label_nutrients import BrandedFoodItemLabelNutrients  # noqa: F401,E501
from FoodCentralAPI.models.food_nutrient import FoodNutrient  # noqa: F401,E501
from FoodCentralAPI.models.food_update_log import FoodUpdateLog  # noqa: F401,E501
from FoodCentralAPI import util


class BrandedFoodItem(Model):
    """NOTE: This class is auto generated by the swagger code generator program.

    Do not edit the class manually.
    """
    def __init__(self, fdc_id: int=None, available_date: str=None, brand_owner: str=None, data_source: str=None, data_type: str=None, description: str=None, food_class: str=None, gtin_upc: str=None, household_serving_full_text: str=None, ingredients: str=None, modified_date: str=None, publication_date: str=None, serving_size: int=None, serving_size_unit: str=None, preparation_state_code: str=None, branded_food_category: str=None, trade_channel: List[str]=None, gpc_class_code: int=None, food_nutrients: List[FoodNutrient]=None, food_update_log: List[FoodUpdateLog]=None, label_nutrients: BrandedFoodItemLabelNutrients=None):  # noqa: E501
        """BrandedFoodItem - a model defined in Swagger

        :param fdc_id: The fdc_id of this BrandedFoodItem.  # noqa: E501
        :type fdc_id: int
        :param available_date: The available_date of this BrandedFoodItem.  # noqa: E501
        :type available_date: str
        :param brand_owner: The brand_owner of this BrandedFoodItem.  # noqa: E501
        :type brand_owner: str
        :param data_source: The data_source of this BrandedFoodItem.  # noqa: E501
        :type data_source: str
        :param data_type: The data_type of this BrandedFoodItem.  # noqa: E501
        :type data_type: str
        :param description: The description of this BrandedFoodItem.  # noqa: E501
        :type description: str
        :param food_class: The food_class of this BrandedFoodItem.  # noqa: E501
        :type food_class: str
        :param gtin_upc: The gtin_upc of this BrandedFoodItem.  # noqa: E501
        :type gtin_upc: str
        :param household_serving_full_text: The household_serving_full_text of this BrandedFoodItem.  # noqa: E501
        :type household_serving_full_text: str
        :param ingredients: The ingredients of this BrandedFoodItem.  # noqa: E501
        :type ingredients: str
        :param modified_date: The modified_date of this BrandedFoodItem.  # noqa: E501
        :type modified_date: str
        :param publication_date: The publication_date of this BrandedFoodItem.  # noqa: E501
        :type publication_date: str
        :param serving_size: The serving_size of this BrandedFoodItem.  # noqa: E501
        :type serving_size: int
        :param serving_size_unit: The serving_size_unit of this BrandedFoodItem.  # noqa: E501
        :type serving_size_unit: str
        :param preparation_state_code: The preparation_state_code of this BrandedFoodItem.  # noqa: E501
        :type preparation_state_code: str
        :param branded_food_category: The branded_food_category of this BrandedFoodItem.  # noqa: E501
        :type branded_food_category: str
        :param trade_channel: The trade_channel of this BrandedFoodItem.  # noqa: E501
        :type trade_channel: List[str]
        :param gpc_class_code: The gpc_class_code of this BrandedFoodItem.  # noqa: E501
        :type gpc_class_code: int
        :param food_nutrients: The food_nutrients of this BrandedFoodItem.  # noqa: E501
        :type food_nutrients: List[FoodNutrient]
        :param food_update_log: The food_update_log of this BrandedFoodItem.  # noqa: E501
        :type food_update_log: List[FoodUpdateLog]
        :param label_nutrients: The label_nutrients of this BrandedFoodItem.  # noqa: E501
        :type label_nutrients: BrandedFoodItemLabelNutrients
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
            'preparation_state_code': str,
            'branded_food_category': str,
            'trade_channel': List[str],
            'gpc_class_code': int,
            'food_nutrients': List[FoodNutrient],
            'food_update_log': List[FoodUpdateLog],
            'label_nutrients': BrandedFoodItemLabelNutrients
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
            'preparation_state_code': 'preparationStateCode',
            'branded_food_category': 'brandedFoodCategory',
            'trade_channel': 'tradeChannel',
            'gpc_class_code': 'gpcClassCode',
            'food_nutrients': 'foodNutrients',
            'food_update_log': 'foodUpdateLog',
            'label_nutrients': 'labelNutrients'
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
        self._preparation_state_code = preparation_state_code
        self._branded_food_category = branded_food_category
        self._trade_channel = trade_channel
        self._gpc_class_code = gpc_class_code
        self._food_nutrients = food_nutrients
        self._food_update_log = food_update_log
        self._label_nutrients = label_nutrients

    @classmethod
    def from_dict(cls, dikt) -> 'BrandedFoodItem':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The BrandedFoodItem of this BrandedFoodItem.  # noqa: E501
        :rtype: BrandedFoodItem
        """
        return util.deserialize_model(dikt, cls)

    @property
    def fdc_id(self) -> int:
        """Gets the fdc_id of this BrandedFoodItem.


        :return: The fdc_id of this BrandedFoodItem.
        :rtype: int
        """
        return self._fdc_id

    @fdc_id.setter
    def fdc_id(self, fdc_id: int):
        """Sets the fdc_id of this BrandedFoodItem.


        :param fdc_id: The fdc_id of this BrandedFoodItem.
        :type fdc_id: int
        """
        if fdc_id is None:
            raise ValueError("Invalid value for `fdc_id`, must not be `None`")  # noqa: E501

        self._fdc_id = fdc_id

    @property
    def available_date(self) -> str:
        """Gets the available_date of this BrandedFoodItem.


        :return: The available_date of this BrandedFoodItem.
        :rtype: str
        """
        return self._available_date

    @available_date.setter
    def available_date(self, available_date: str):
        """Sets the available_date of this BrandedFoodItem.


        :param available_date: The available_date of this BrandedFoodItem.
        :type available_date: str
        """

        self._available_date = available_date

    @property
    def brand_owner(self) -> str:
        """Gets the brand_owner of this BrandedFoodItem.


        :return: The brand_owner of this BrandedFoodItem.
        :rtype: str
        """
        return self._brand_owner

    @brand_owner.setter
    def brand_owner(self, brand_owner: str):
        """Sets the brand_owner of this BrandedFoodItem.


        :param brand_owner: The brand_owner of this BrandedFoodItem.
        :type brand_owner: str
        """

        self._brand_owner = brand_owner

    @property
    def data_source(self) -> str:
        """Gets the data_source of this BrandedFoodItem.


        :return: The data_source of this BrandedFoodItem.
        :rtype: str
        """
        return self._data_source

    @data_source.setter
    def data_source(self, data_source: str):
        """Sets the data_source of this BrandedFoodItem.


        :param data_source: The data_source of this BrandedFoodItem.
        :type data_source: str
        """

        self._data_source = data_source

    @property
    def data_type(self) -> str:
        """Gets the data_type of this BrandedFoodItem.


        :return: The data_type of this BrandedFoodItem.
        :rtype: str
        """
        return self._data_type

    @data_type.setter
    def data_type(self, data_type: str):
        """Sets the data_type of this BrandedFoodItem.


        :param data_type: The data_type of this BrandedFoodItem.
        :type data_type: str
        """
        if data_type is None:
            raise ValueError("Invalid value for `data_type`, must not be `None`")  # noqa: E501

        self._data_type = data_type

    @property
    def description(self) -> str:
        """Gets the description of this BrandedFoodItem.


        :return: The description of this BrandedFoodItem.
        :rtype: str
        """
        return self._description

    @description.setter
    def description(self, description: str):
        """Sets the description of this BrandedFoodItem.


        :param description: The description of this BrandedFoodItem.
        :type description: str
        """
        if description is None:
            raise ValueError("Invalid value for `description`, must not be `None`")  # noqa: E501

        self._description = description

    @property
    def food_class(self) -> str:
        """Gets the food_class of this BrandedFoodItem.


        :return: The food_class of this BrandedFoodItem.
        :rtype: str
        """
        return self._food_class

    @food_class.setter
    def food_class(self, food_class: str):
        """Sets the food_class of this BrandedFoodItem.


        :param food_class: The food_class of this BrandedFoodItem.
        :type food_class: str
        """

        self._food_class = food_class

    @property
    def gtin_upc(self) -> str:
        """Gets the gtin_upc of this BrandedFoodItem.


        :return: The gtin_upc of this BrandedFoodItem.
        :rtype: str
        """
        return self._gtin_upc

    @gtin_upc.setter
    def gtin_upc(self, gtin_upc: str):
        """Sets the gtin_upc of this BrandedFoodItem.


        :param gtin_upc: The gtin_upc of this BrandedFoodItem.
        :type gtin_upc: str
        """

        self._gtin_upc = gtin_upc

    @property
    def household_serving_full_text(self) -> str:
        """Gets the household_serving_full_text of this BrandedFoodItem.


        :return: The household_serving_full_text of this BrandedFoodItem.
        :rtype: str
        """
        return self._household_serving_full_text

    @household_serving_full_text.setter
    def household_serving_full_text(self, household_serving_full_text: str):
        """Sets the household_serving_full_text of this BrandedFoodItem.


        :param household_serving_full_text: The household_serving_full_text of this BrandedFoodItem.
        :type household_serving_full_text: str
        """

        self._household_serving_full_text = household_serving_full_text

    @property
    def ingredients(self) -> str:
        """Gets the ingredients of this BrandedFoodItem.


        :return: The ingredients of this BrandedFoodItem.
        :rtype: str
        """
        return self._ingredients

    @ingredients.setter
    def ingredients(self, ingredients: str):
        """Sets the ingredients of this BrandedFoodItem.


        :param ingredients: The ingredients of this BrandedFoodItem.
        :type ingredients: str
        """

        self._ingredients = ingredients

    @property
    def modified_date(self) -> str:
        """Gets the modified_date of this BrandedFoodItem.


        :return: The modified_date of this BrandedFoodItem.
        :rtype: str
        """
        return self._modified_date

    @modified_date.setter
    def modified_date(self, modified_date: str):
        """Sets the modified_date of this BrandedFoodItem.


        :param modified_date: The modified_date of this BrandedFoodItem.
        :type modified_date: str
        """

        self._modified_date = modified_date

    @property
    def publication_date(self) -> str:
        """Gets the publication_date of this BrandedFoodItem.


        :return: The publication_date of this BrandedFoodItem.
        :rtype: str
        """
        return self._publication_date

    @publication_date.setter
    def publication_date(self, publication_date: str):
        """Sets the publication_date of this BrandedFoodItem.


        :param publication_date: The publication_date of this BrandedFoodItem.
        :type publication_date: str
        """

        self._publication_date = publication_date

    @property
    def serving_size(self) -> int:
        """Gets the serving_size of this BrandedFoodItem.


        :return: The serving_size of this BrandedFoodItem.
        :rtype: int
        """
        return self._serving_size

    @serving_size.setter
    def serving_size(self, serving_size: int):
        """Sets the serving_size of this BrandedFoodItem.


        :param serving_size: The serving_size of this BrandedFoodItem.
        :type serving_size: int
        """

        self._serving_size = serving_size

    @property
    def serving_size_unit(self) -> str:
        """Gets the serving_size_unit of this BrandedFoodItem.


        :return: The serving_size_unit of this BrandedFoodItem.
        :rtype: str
        """
        return self._serving_size_unit

    @serving_size_unit.setter
    def serving_size_unit(self, serving_size_unit: str):
        """Sets the serving_size_unit of this BrandedFoodItem.


        :param serving_size_unit: The serving_size_unit of this BrandedFoodItem.
        :type serving_size_unit: str
        """

        self._serving_size_unit = serving_size_unit

    @property
    def preparation_state_code(self) -> str:
        """Gets the preparation_state_code of this BrandedFoodItem.


        :return: The preparation_state_code of this BrandedFoodItem.
        :rtype: str
        """
        return self._preparation_state_code

    @preparation_state_code.setter
    def preparation_state_code(self, preparation_state_code: str):
        """Sets the preparation_state_code of this BrandedFoodItem.


        :param preparation_state_code: The preparation_state_code of this BrandedFoodItem.
        :type preparation_state_code: str
        """

        self._preparation_state_code = preparation_state_code

    @property
    def branded_food_category(self) -> str:
        """Gets the branded_food_category of this BrandedFoodItem.


        :return: The branded_food_category of this BrandedFoodItem.
        :rtype: str
        """
        return self._branded_food_category

    @branded_food_category.setter
    def branded_food_category(self, branded_food_category: str):
        """Sets the branded_food_category of this BrandedFoodItem.


        :param branded_food_category: The branded_food_category of this BrandedFoodItem.
        :type branded_food_category: str
        """

        self._branded_food_category = branded_food_category

    @property
    def trade_channel(self) -> List[str]:
        """Gets the trade_channel of this BrandedFoodItem.


        :return: The trade_channel of this BrandedFoodItem.
        :rtype: List[str]
        """
        return self._trade_channel

    @trade_channel.setter
    def trade_channel(self, trade_channel: List[str]):
        """Sets the trade_channel of this BrandedFoodItem.


        :param trade_channel: The trade_channel of this BrandedFoodItem.
        :type trade_channel: List[str]
        """

        self._trade_channel = trade_channel

    @property
    def gpc_class_code(self) -> int:
        """Gets the gpc_class_code of this BrandedFoodItem.


        :return: The gpc_class_code of this BrandedFoodItem.
        :rtype: int
        """
        return self._gpc_class_code

    @gpc_class_code.setter
    def gpc_class_code(self, gpc_class_code: int):
        """Sets the gpc_class_code of this BrandedFoodItem.


        :param gpc_class_code: The gpc_class_code of this BrandedFoodItem.
        :type gpc_class_code: int
        """

        self._gpc_class_code = gpc_class_code

    @property
    def food_nutrients(self) -> List[FoodNutrient]:
        """Gets the food_nutrients of this BrandedFoodItem.


        :return: The food_nutrients of this BrandedFoodItem.
        :rtype: List[FoodNutrient]
        """
        return self._food_nutrients

    @food_nutrients.setter
    def food_nutrients(self, food_nutrients: List[FoodNutrient]):
        """Sets the food_nutrients of this BrandedFoodItem.


        :param food_nutrients: The food_nutrients of this BrandedFoodItem.
        :type food_nutrients: List[FoodNutrient]
        """

        self._food_nutrients = food_nutrients

    @property
    def food_update_log(self) -> List[FoodUpdateLog]:
        """Gets the food_update_log of this BrandedFoodItem.


        :return: The food_update_log of this BrandedFoodItem.
        :rtype: List[FoodUpdateLog]
        """
        return self._food_update_log

    @food_update_log.setter
    def food_update_log(self, food_update_log: List[FoodUpdateLog]):
        """Sets the food_update_log of this BrandedFoodItem.


        :param food_update_log: The food_update_log of this BrandedFoodItem.
        :type food_update_log: List[FoodUpdateLog]
        """

        self._food_update_log = food_update_log

    @property
    def label_nutrients(self) -> BrandedFoodItemLabelNutrients:
        """Gets the label_nutrients of this BrandedFoodItem.


        :return: The label_nutrients of this BrandedFoodItem.
        :rtype: BrandedFoodItemLabelNutrients
        """
        return self._label_nutrients

    @label_nutrients.setter
    def label_nutrients(self, label_nutrients: BrandedFoodItemLabelNutrients):
        """Sets the label_nutrients of this BrandedFoodItem.


        :param label_nutrients: The label_nutrients of this BrandedFoodItem.
        :type label_nutrients: BrandedFoodItemLabelNutrients
        """

        self._label_nutrients = label_nutrients
