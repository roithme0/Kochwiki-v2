import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://test:test@db:5432/kochwiki_test")

from app.db.session import engine
from app.main import app


@pytest.fixture(autouse=True)
def clear_database() -> None:
    with engine.begin() as connection:
        connection.execute(text('TRUNCATE TABLE ingredient, step, recipe, foodstuff, custom_user RESTART IDENTITY CASCADE'))


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client
