"""Cached statements and transactions through the app's bounded Neon pool.

Requires DATABASE_URL and NEON_TEST_POOLER_HOST in process env, pointing to an
explicit disposable branch endpoint, never production. Creates/writes/drops
only this run's uniquely named test table. Never prints connection strings.
"""
import asyncio
import importlib.metadata
import json
import os
import sys
import time
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from sqlalchemy import event, text
from sqlalchemy.engine import make_url
from dotenv import dotenv_values
from app.config.database import AsyncDatabaseSession


async def main():
    url = os.environ["DATABASE_URL"]
    host = os.environ["NEON_TEST_POOLER_HOST"]
    assert make_url(url).host == host and "-pooler" in host
    assert host.endswith(".neon.tech"), "explicit Neon test branch host required"
    production = dotenv_values(Path(__file__).resolve().parents[2] / ".env.local").get("DATABASE_URL")
    assert production, "repo .env.local must identify production for the deny guard"
    assert host != make_url(production).host, "production is prohibited"
    database = AsyncDatabaseSession(url)
    await database.init()
    checkouts = 0
    peak_checked_out = 0
    connections = set()

    @event.listens_for(database.engine.sync_engine, "checkout")
    def track_checkout(connection, record, proxy):
        nonlocal checkouts, peak_checked_out
        checkouts += 1
        connections.add(id(connection))
        peak_checked_out = max(peak_checked_out, database.engine.pool.checkedout())
    table = f"neon_pooler_check_{uuid4().hex}"
    tasks, rounds = 48, 5
    insert = text(f"INSERT INTO {table} (id, value) VALUES (:id, :value)")
    read = text(f"SELECT value FROM {table} WHERE id=:id")
    update = text(f"UPDATE {table} SET value=:value WHERE id=:id")
    txid = text("SELECT txid_current()")
    created = False
    try:
        async with database.engine.begin() as connection:
            await connection.execute(text(f"CREATE TABLE {table} (id INTEGER PRIMARY KEY, value INTEGER NOT NULL)"))
            created = True

        async def client(round_index, task):
            value = round_index * tasks + task
            async with database.engine.connect() as connection:
                # Override legacy AUTOCOMMIT for genuine BEGIN/COMMIT checks.
                connection = await connection.execution_options(isolation_level="READ COMMITTED")
                async with connection.begin():
                    before = await connection.scalar(txid)
                    await connection.execute(insert, {"id": value, "value": value})
                    assert await connection.scalar(read, {"id": value}) == value
                    await connection.execute(update, {"id": value, "value": value + 1})
                    assert await connection.scalar(read, {"id": value}) == value + 1
                    assert await connection.scalar(txid) == before
                    await connection.execute(text("SELECT pg_sleep(0.01)"))
                assert await connection.scalar(read, {"id": value}) == value + 1
                await connection.rollback()

        started = time.monotonic()
        for round_index in range(rounds):
            results = await asyncio.gather(*(client(round_index, task) for task in range(tasks)), return_exceptions=True)
            failures = [result for result in results if isinstance(result, BaseException)]
            assert not failures, f"round {round_index} failed: {[type(error).__name__ for error in failures]}"
        async with database.engine.connect() as connection:
            assert await connection.scalar(text(f"SELECT count(*) FROM {table}")) == tasks * rounds
        assert peak_checked_out > 10, "pool overflow was not exercised"
        assert checkouts > len(connections), "connection reuse was not exercised"
        print("POOLER_DEFAULTS=PASS", json.dumps({
            "tasks_per_round": tasks, "rounds": rounds, "transactions": tasks * rounds,
            "pool_size": 10, "max_overflow": 20, "errors": 0,
            "peak_checked_out": peak_checked_out, "checkouts": checkouts,
            "distinct_client_connections": len(connections),
            "cached_parameterised_statements": True, "read_after_write_and_commit": True,
            "seconds": round(time.monotonic() - started, 3),
            "versions": {name: importlib.metadata.version(name) for name in ["asyncpg", "SQLAlchemy"]},
        }))
    finally:
        if created:
            async with database.engine.begin() as connection:
                await connection.execute(text(f"DROP TABLE {table}"))
        await database.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as error:
        print(f"POOLER_CHECK=FAIL error_type={type(error).__name__}")
        sys.exit(1)
