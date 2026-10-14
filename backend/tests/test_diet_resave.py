"""Diet replacement at the real repository seam, with SQL I/O faked."""
import asyncio
import logging
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from app.api.models.food4u.meals import DietType
from app.api.repo.preference_repo import PreferenceRepository


class DietSession:
    def __init__(self):
        self.added = []

    async def execute(self, statement):
        params = statement.compile().params
        name = params.get("diet_name_1")
        known = {"Vegetarian": 1, "Vegan": 2}
        diet = DietType(id=known[name], diet_name=name) if name in known else None
        return SimpleNamespace(scalars=lambda: SimpleNamespace(first=lambda: diet))

    def add(self, row):
        self.added.append(row)

    async def commit(self):
        pass


def repository(current):
    repo = PreferenceRepository(DietSession())
    repo.get_profile_diets = AsyncMock(return_value=[
        DietType(id=index + 1, diet_name=name) for index, name in enumerate(current)])
    # Spies retain the actual link/unlink/name lookup logic, including its SQL
    # ArgumentError for a DietType object and ValueError for an unknown name.
    repo.link_profile_to_diet = AsyncMock(wraps=repo.link_profile_to_diet)
    repo.unlink_profile_from_diet = AsyncMock(wraps=repo.unlink_profile_from_diet)
    return repo


def test_same_diet_resave_is_noop():
    repo = repository(["Vegetarian"])
    asyncio.run(repo.updateUserDiet(7, ["Vegetarian"]))
    repo.link_profile_to_diet.assert_not_awaited()
    repo.unlink_profile_from_diet.assert_not_awaited()


def test_changed_diet_links_and_unlinks_by_name():
    repo = repository(["Vegetarian"])
    asyncio.run(repo.updateUserDiet(7, ["Vegan"]))
    repo.link_profile_to_diet.assert_awaited_once_with(7, "Vegan")
    repo.unlink_profile_from_diet.assert_awaited_once_with(7, "Vegetarian")


def test_unknown_diet_is_skipped_and_logged(caplog):
    repo = repository([])
    with caplog.at_level(logging.WARNING):
        asyncio.run(repo.updateUserDiet(7, ["Unknown diet"]))
    assert not repo.db.added
    repo.unlink_profile_from_diet.assert_not_awaited()
    assert "Unknown diet" in caplog.text


def test_empty_submission_removes_existing_diet():
    repo = repository(["Vegetarian"])
    asyncio.run(repo.updateUserDiet(7, []))
    repo.link_profile_to_diet.assert_not_awaited()
    repo.unlink_profile_from_diet.assert_awaited_once_with(7, "Vegetarian")
