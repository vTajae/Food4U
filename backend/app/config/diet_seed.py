"""Add standard diet references without replacing locally maintained rows."""
from sqlalchemy.dialects.postgresql import insert
from app.api.models.food4u.meals import DietType

STANDARD_DIETS = (
    "Gluten Free", "Ketogenic", "Vegetarian", "Lacto-Vegetarian",
    "Ovo-Vegetarian", "Vegan", "Pescetarian", "Paleo", "Primal",
    "Low FODMAP", "Whole30",
)


async def seed_diet_types(database):
    statement = insert(DietType).values([
        {"diet_name": name, "description": ""} for name in STANDARD_DIETS
    ]).on_conflict_do_nothing(index_elements=[DietType.diet_name])
    async with database.get_session() as session:
        await session.execute(statement)
        await session.commit()
