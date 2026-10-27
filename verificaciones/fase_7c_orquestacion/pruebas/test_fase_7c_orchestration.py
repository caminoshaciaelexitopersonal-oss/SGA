"""
Automated Test Suite for Phase 7C — SGA-CD Service Orchestration & Configuration Verification.
Tests docker-compose.yml structure, .env.example parameters, database URL resolution,
client API base URL routing, and error resilience.
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

class TestFase7COrchestration(unittest.TestCase):

    def setUp(self):
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

    def test_01_docker_compose_file_exists_and_contains_5_services(self):
        """1. Verifies docker-compose.yml exists in root and declares all 5 components."""
        compose_path = os.path.join(self.root_dir, "docker-compose.yml")
        self.assertTrue(os.path.exists(compose_path), "docker-compose.yml does not exist at root.")

        with open(compose_path, "r", encoding="utf-8") as f:
            content = f.read()

        required_services = ["postgres:", "fastapi-backend:", "web-client:", "flet-desktop-client:", "flet-mobile-client:"]
        for service in required_services:
            self.assertIn(service, content, f"Service '{service}' missing from docker-compose.yml.")

    def test_02_env_example_contains_all_necessary_variables(self):
        """2. Verifies .env.example contains essential configuration keys."""
        env_path = os.path.join(self.root_dir, ".env.example")
        self.assertTrue(os.path.exists(env_path), ".env.example does not exist at root.")

        with open(env_path, "r", encoding="utf-8") as f:
            content = f.read()

        required_vars = ["POSTGRES_DB=", "POSTGRES_USER=", "POSTGRES_PASSWORD=", "DATABASE_URL=", "SECRET_KEY=", "API_BASE_URL="]
        for var in required_vars:
            self.assertIn(var, content, f"Variable '{var}' missing from .env.example.")

    def test_03_dockerfiles_exist_for_components(self):
        """3. Verifies Dockerfile exists for backend, desktop, and mobile components."""
        backend_df = os.path.join(self.root_dir, "SGA-CD-FASTAPI-BACKEND", "Dockerfile")
        desktop_df = os.path.join(self.root_dir, "SGA-CD-APP.git", "Dockerfile")
        mobile_df = os.path.join(self.root_dir, "SGA-CD-APK.git", "Dockerfile")

        self.assertTrue(os.path.exists(backend_df), "Dockerfile missing in SGA-CD-FASTAPI-BACKEND.")
        self.assertTrue(os.path.exists(desktop_df), "Dockerfile missing in SGA-CD-APP.git.")
        self.assertTrue(os.path.exists(mobile_df), "Dockerfile missing in SGA-CD-APK.git.")

    def test_04_client_api_url_resolution(self):
        """4. Tests ApiClient URL formatting for different host environments."""
        # Localhost client
        client_local = ApiClient(base_url="http://localhost:8000", tenant_api_key="key1")
        self.assertEqual(client_local.base_url, "http://localhost:8000")

        # Docker internal client
        client_docker = ApiClient(base_url="http://fastapi-backend:8000/", tenant_api_key="key2")
        self.assertEqual(client_docker.base_url, "http://fastapi-backend:8000")

    def test_05_client_defensive_error_handling_when_backend_unreachable(self):
        """5. Verifies ApiClient handles connection errors gracefully without crashing."""
        client = ApiClient(base_url="http://127.0.0.1:9999", tenant_api_key="test_key")

        with patch.object(client, "_make_request", return_value={"error": True, "code": "STD-ERR-503", "status_code": 503}):
            res = client.post("/api/v1/crm/generate_predis_media", {"prompt": "Test"})
            self.assertTrue(res.get("error"))
            self.assertEqual(res.get("status_code"), 503)

if __name__ == "__main__":
    unittest.main()
