# coding: utf-8

"""
    spoonacular API

    The spoonacular Nutrition, Recipe, and Food API allows you to access over thousands of recipes, thousands of ingredients, 800,000 food products, over 100,000 menu items, and restaurants. Our food ontology and semantic recipe search engine makes it possible to search for recipes using natural language queries, such as \"gluten free brownies without sugar\" or \"low fat vegan cupcakes.\" You can automatically calculate the nutritional information for any recipe, analyze recipe costs, visualize ingredient lists, find recipes for what's in your fridge, find recipes based on special diets, nutritional requirements, or favorite ingredients, classify recipes into types and cuisines, convert ingredient amounts, or even compute an entire meal plan. With our powerful API, you can create many kinds of food and especially nutrition apps.  Special diets/dietary requirements currently available include: vegan, vegetarian, pescetarian, gluten free, grain free, dairy free, high protein, whole 30, low sodium, low carb, Paleo, ketogenic, FODMAP, and Primal.

    The version of the OpenAPI document: 2.0.1
    Contact: mail@spoonacular.com
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


from __future__ import annotations
import pprint
import re  # noqa: F401
import json

from pydantic import BaseModel, ConfigDict
from typing import Any, ClassVar, Dict, List
from spoonacular.models.comparable_product import ComparableProduct
from typing import Optional, Set
from typing_extensions import Self

class GetComparableProducts200ResponseComparableProducts(BaseModel):
    """
    GetComparableProducts200ResponseComparableProducts
    """ # noqa: E501
    calories: List[ComparableProduct]
    likes: List[ComparableProduct]
    price: List[ComparableProduct]
    protein: List[ComparableProduct]
    spoonacular_score: List[ComparableProduct]
    sugar: List[ComparableProduct]
    __properties: ClassVar[List[str]] = ["calories", "likes", "price", "protein", "spoonacular_score", "sugar"]

    model_config = ConfigDict(
        populate_by_name=True,
        validate_assignment=True,
        protected_namespaces=(),
    )


    def to_str(self) -> str:
        """Returns the string representation of the model using alias"""
        return pprint.pformat(self.model_dump(by_alias=True))

    def to_json(self) -> str:
        """Returns the JSON representation of the model using alias"""
        # TODO: pydantic v2: use .model_dump_json(by_alias=True, exclude_unset=True) instead
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> Optional[Self]:
        """Create an instance of GetComparableProducts200ResponseComparableProducts from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self) -> Dict[str, Any]:
        """Return the dictionary representation of the model using alias.

        This has the following differences from calling pydantic's
        `self.model_dump(by_alias=True)`:

        * `None` is only added to the output dict for nullable fields that
          were set at model initialization. Other fields with value `None`
          are ignored.
        """
        excluded_fields: Set[str] = set([
        ])

        _dict = self.model_dump(
            by_alias=True,
            exclude=excluded_fields,
            exclude_none=True,
        )
        # override the default output from pydantic by calling `to_dict()` of each item in calories (list)
        _items = []
        if self.calories:
            for _item in self.calories:
                if _item:
                    _items.append(_item.to_dict())
            _dict['calories'] = _items
        # override the default output from pydantic by calling `to_dict()` of each item in likes (list)
        _items = []
        if self.likes:
            for _item in self.likes:
                if _item:
                    _items.append(_item.to_dict())
            _dict['likes'] = _items
        # override the default output from pydantic by calling `to_dict()` of each item in price (list)
        _items = []
        if self.price:
            for _item in self.price:
                if _item:
                    _items.append(_item.to_dict())
            _dict['price'] = _items
        # override the default output from pydantic by calling `to_dict()` of each item in protein (list)
        _items = []
        if self.protein:
            for _item in self.protein:
                if _item:
                    _items.append(_item.to_dict())
            _dict['protein'] = _items
        # override the default output from pydantic by calling `to_dict()` of each item in spoonacular_score (list)
        _items = []
        if self.spoonacular_score:
            for _item in self.spoonacular_score:
                if _item:
                    _items.append(_item.to_dict())
            _dict['spoonacular_score'] = _items
        # override the default output from pydantic by calling `to_dict()` of each item in sugar (list)
        _items = []
        if self.sugar:
            for _item in self.sugar:
                if _item:
                    _items.append(_item.to_dict())
            _dict['sugar'] = _items
        return _dict

    @classmethod
    def from_dict(cls, obj: Optional[Dict[str, Any]]) -> Optional[Self]:
        """Create an instance of GetComparableProducts200ResponseComparableProducts from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return cls.model_validate(obj)

        _obj = cls.model_validate({
            "calories": [ComparableProduct.from_dict(_item) for _item in obj["calories"]] if obj.get("calories") is not None else None,
            "likes": [ComparableProduct.from_dict(_item) for _item in obj["likes"]] if obj.get("likes") is not None else None,
            "price": [ComparableProduct.from_dict(_item) for _item in obj["price"]] if obj.get("price") is not None else None,
            "protein": [ComparableProduct.from_dict(_item) for _item in obj["protein"]] if obj.get("protein") is not None else None,
            "spoonacular_score": [ComparableProduct.from_dict(_item) for _item in obj["spoonacular_score"]] if obj.get("spoonacular_score") is not None else None,
            "sugar": [ComparableProduct.from_dict(_item) for _item in obj["sugar"]] if obj.get("sugar") is not None else None
        })
        return _obj


