import os
import sys
import pytest
from typing import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add the directory containing the 'models' package to the Python path.
# This is a workaround for the monorepo structure where the database models
# are in a separate project directory.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'SGA-CD-DB.git')))

from app.main import app
from app.api import deps
from models.base import Base
import models # Import all models to ensure they are registered with the Base

# --- Test Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables in the in-memory database before tests run
Base.metadata.create_all(bind=engine)

# --- Dependency Override ---
def override_get_db() -> Generator:
    """
    FastAPI dependency that provides a test database session.
    """
    db = None
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        if db:
            db.close()

app.dependency_overrides[deps.get_db] = override_get_db

# --- Test Fixtures ---
@pytest.fixture(scope="function")
def db() -> Generator:
    """
    A fixture that provides a test database session for setting up test data.
    It creates tables before each test and drops them afterwards.
    """
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client() -> Generator:
    """
    A fixture that provides a TestClient for making requests to the API.
    """
    with TestClient(app) as c:
        yield c
