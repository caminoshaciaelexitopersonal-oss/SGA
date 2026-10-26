"""
Automated Test Suite for Phase 7D — SGA-CD Orchestration Validation & Health Contract Testing.
Tests syntax completeness of docker-compose.yml, environment variables mapping,
and client connection contracts under orchestration settings.
"""
import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Ensure SGA-CD-FASTAPI-BACKEND is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../SGA-CD-FASTAPI-BACKEND"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

desktop_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../SGA-CD-APP.git"))
if desktop_path not in sys.path:
    sys.path.insert(0, desktop_path)

# Mock requests if missing
if "requests" not in sys.modules:
    sys.modules["requests"] = MagicMock()

from utils.api_client import ApiClient

class TestFase7DOrchestrationValidation(unittest.TestCase):

    def setUp(self):
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

    def test_01_docker_compose_structure_validation(self):
        """1. Validates docker-compose.yml contains required volumes, networks, and services."""
        compose_path = os.path.join(self.root_dir, "docker-compose.yml")
        self.assertTrue(os.path.exists(compose_path))

        with open(compose_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("version: '3.8'", content)
        self.assertIn("postgres_data:", content)
        self.assertIn("pg_isready", content)
        self.assertIn("5432:5432", content)
        self.assertIn("8000:8000", content)
        self.assertIn("8080:80", content)

    def test_02_env_example_completeness(self):
        """2. Validates .env.example contains all production-grade key definitions."""
        env_path = os.path.join(self.root_dir, ".env.example")
        self.assertTrue(os.path.exists(env_path))

        with open(env_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("POSTGRES_DB=", content)
        self.assertIn("POSTGRES_USER=", content)
        self.assertIn("POSTGRES_PASSWORD=", content)
        self.assertIn("DATABASE_URL=", content)
        self.assertIn("SECRET_KEY=", content)
        self.assertIn("API_BASE_URL=", content)

    def test_03_client_url_resolution_orchestrated(self):
        """3. Validates client API resolution in containerized network mode."""
        client_orchestrated = ApiClient(base_url="http://fastapi-backend:8000", tenant_api_key="test_key")
        self.assertEqual(client_orchestrated.base_url, "http://fastapi-backend:8000")

    def test_04_client_error_recovery_under_orchestration_outage(self):
        """4. Validates ApiClient returns formatted error status on connection failure."""
        client = ApiClient(base_url="http://fastapi-backend:8000", tenant_api_key="test_key")

        with patch.object(client, "_make_request", return_value={"error": True, "code": "STD-ERR-503", "status_code": 503}):
            res = client.post("/api/v1/crm/generate_predis_media", {"prompt": "Test Orchestration"})
            self.assertTrue(res.get("error"))
            self.assertEqual(res.get("status_code"), 503)

if __name__ == "__main__":
    unittest.main()
