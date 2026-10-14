"""Welcome preferences at the service seam, using a no-database fake repo."""
import asyncio
from unittest.mock import AsyncMock

import pytest
from app.api.schemas.food4u.welcome import Suggestion
from app.api.services.food4u.preferences_service import PreferenceService


def repo():
    class FakeRepo:
        updateUserDiet = AsyncMock()
        updateUserPricePreferences = AsyncMock()
        updateUserCuisinePreferences = AsyncMock()
    return FakeRepo()


def test_diets_are_saved_once_as_names_not_characters():
    fake = repo()
    asyncio.run(PreferenceService(fake).post_preferences(7, 5555, "diets", [
        Suggestion(name="Vegetarian"), Suggestion(value="ignored"), Suggestion(name="Vegan"), Suggestion(name=""),
    ]))
    fake.updateUserDiet.assert_awaited_once_with(7, ["Vegetarian", "Vegan"])
    fake.updateUserPricePreferences.assert_not_awaited()
    fake.updateUserCuisinePreferences.assert_not_awaited()


def test_price_preserves_first_value_as_entered():
    fake = repo()
    asyncio.run(PreferenceService(fake).post_preferences(7, 555, "price", [Suggestion(value="12.50"), Suggestion(value="99")]))
    fake.updateUserPricePreferences.assert_awaited_once_with(7, "12.50")
    fake.updateUserDiet.assert_not_awaited()
    fake.updateUserCuisinePreferences.assert_not_awaited()


@pytest.mark.parametrize("key,question,answers", [
    ("price", 555, []), ("price", 555, [Suggestion(value="")]),
    ("price", 555, [Suggestion(), Suggestion(value="12.50")]),
])
def test_empty_price_answers_are_noop(key, question, answers):
    fake = repo()
    assert asyncio.run(PreferenceService(fake).post_preferences(7, question, key, answers)) is None
    fake.updateUserDiet.assert_not_awaited()
    fake.updateUserPricePreferences.assert_not_awaited()
    fake.updateUserCuisinePreferences.assert_not_awaited()


@pytest.mark.parametrize("question,kind", [(5, "like"), (55, "dislike")])
def test_cuisines_are_unchanged(question, kind):
    fake = repo()
    asyncio.run(PreferenceService(fake).post_preferences(7, question, "cuisines", [Suggestion(name="Italian")]))
    fake.updateUserCuisinePreferences.assert_awaited_once_with(7, ["Italian"], kind)
    fake.updateUserDiet.assert_not_awaited()
    fake.updateUserPricePreferences.assert_not_awaited()


@pytest.mark.parametrize("key,question", [("diets", 55), ("price", 5), ("unknown", 555)])
def test_invalid_dispatch_remains_rejected(key, question):
    fake = repo()
    assert asyncio.run(PreferenceService(fake).post_preferences(7, question, key, [Suggestion(name="Vegan", value="12.50")])) == {"error": "Invalid query key"}
    fake.updateUserDiet.assert_not_awaited()
    fake.updateUserPricePreferences.assert_not_awaited()


@pytest.mark.parametrize("answers", [[], [Suggestion(), Suggestion(name="")]])
def test_empty_diet_answer_clears_saved_diets(answers):
    fake = repo()
    assert asyncio.run(PreferenceService(fake).post_preferences(7, 5555, "diets", answers)) is None
    fake.updateUserDiet.assert_awaited_once_with(7, [])
    fake.updateUserPricePreferences.assert_not_awaited()
    fake.updateUserCuisinePreferences.assert_not_awaited()
