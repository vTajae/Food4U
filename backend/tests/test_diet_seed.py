"""PostgreSQL seed statement unit proof; never opens a database."""
import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock
from sqlalchemy.dialects import postgresql


def test_seed_inserts_exact_standard_names_without_updating_existing_rows():
    from app.config.diet_seed import seed_diet_types
    session = AsyncMock()
    class Database:
        @asynccontextmanager
        async def get_session(self):
            yield session
    asyncio.run(seed_diet_types(Database()))
    session.execute.assert_awaited_once()
    compiled = session.execute.call_args.args[0].compile(dialect=postgresql.dialect())
    sql = str(compiled)
    assert sql.startswith("INSERT INTO diet_type")
    assert "ON CONFLICT (diet_name) DO NOTHING" in sql
    assert "DO UPDATE" not in sql
    names = [value for key, value in compiled.params.items() if key.startswith("diet_name_")]
    assert names == ["Gluten Free", "Ketogenic", "Vegetarian", "Lacto-Vegetarian", "Ovo-Vegetarian", "Vegan", "Pescetarian", "Paleo", "Primal", "Low FODMAP", "Whole30"]
    session.commit.assert_awaited_once()
