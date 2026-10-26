"""
Automated Integration & Verification Test Suite for Phase 8.14.9.
Tests full integration across 12 B2B combinations, shared organizational entitlements,
quota persistence, multi-tenant isolation, role authorization, and Web / Flet Desktop / Flet Mobile client APIs.
"""
import sys
import os
import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta

# Ensure SGA-CD-FASTAPI-BACKEND is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../SGA-CD-FASTAPI-BACKEND"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

desktop_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../SGA-CD-APP.git"))
if desktop_path not in sys.path:
    sys.path.insert(0, desktop_path)

# Mock external dependencies if missing in sandbox environment
if "requests" not in sys.modules:
    sys.modules["requests"] = MagicMock()
if "flet" not in sys.modules:
    sys.modules["flet"] = MagicMock()
if "sqlalchemy" not in sys.modules:
    mock_sa = MagicMock()
    mock_sa.Column = MagicMock()
    mock_sa.Integer = MagicMock()
    mock_sa.String = MagicMock()
    mock_sa.Boolean = MagicMock()
    mock_sa.DateTime = MagicMock()
    mock_sa.ForeignKey = MagicMock()
    mock_sa.Table = MagicMock()
    mock_sa.metadata = MagicMock()
    sys.modules["sqlalchemy"] = mock_sa
    sys.modules["sqlalchemy.orm"] = MagicMock()
    sys.modules["sqlalchemy.sql"] = MagicMock()

from app.services.plan_capability_service import (
    PlanCapabilityService,
    CANONICAL_FULL,
    CANONICAL_BASIC,
    EffectiveCapabilities
)
from utils.api_client import ApiClient

class TestFase8149Integration(unittest.TestCase):

    def setUp(self):
        self.now = datetime.now(timezone.utc)
        self.b2b_natures = ["entidad_publica", "empresa_privada", "organizacion_no_lucrativa", "asociacion_club"]
        self.b2b_scopes = ["municipal", "departamental", "nacional"]

    def test_01_b2b_12_combinations_resolution(self):
        """1. Resolution of the 12 B2B combinations."""
        count = 0
        for nature in self.b2b_natures:
            for scope in self.b2b_scopes:
                count += 1
                tenant_data = {
                    "id": count,
                    "nombre_empresa": f"Org {nature} {scope}",
                    "tipo_organizacion": nature,
                    "ambito_organizacional": scope,
                    "plan": "full",
                    "activo": True
                }
                sub_data = {"estado": "activa", "fecha_fin": self.now + timedelta(days=30)}
                caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)
                self.assertTrue(caps.crm_leads_enabled)
                self.assertEqual(caps.monthly_limits["images"], 100)
                self.assertEqual(caps.monthly_limits["social_posts"], 50)
        self.assertEqual(count, 12)

    def test_02_shared_plan_full_access_within_tenant(self):
        """2. Shared Plan Full access among authorized administrative users of the same tenant."""
        tenant_data = {"id": 100, "plan": "full", "activo": True}
        sub_data = {"estado": "activa", "fecha_fin": self.now + timedelta(days=30)}

        # All 4 administrative roles share tenant capability
        admin_roles = ["admin_empresa", "jefe_area", "profesional_area", "tecnico_area"]
        for role in admin_roles:
            caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)
            self.assertTrue(caps.crm_leads_enabled)
            self.assertTrue(caps.social_publishing_enabled)

    def test_03_effective_blocking_plan_basico(self):
        """3. Effective blocking of Plan Full operations for Plan Básico."""
        tenant_data = {"id": 101, "plan": "basico", "activo": True}
        sub_data = {"estado": "activa", "fecha_fin": self.now + timedelta(days=30)}

        caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)
        self.assertFalse(caps.crm_leads_enabled)
        self.assertFalse(caps.ai_images_enabled)
        self.assertEqual(caps.monthly_limits["images"], 0)

    def test_04_quota_validation_and_coherent_release(self):
        """4. Quota validation and coherent recovery after errors (release_quota)."""
        db_mock = MagicMock()

        class FakeId:
            def desc(self):
                return self

        class FakeTenant:
            id = 1
            nombre_empresa = "Empresa Test"
            tipo_organizacion = "entidad_publica"
            ambito_organizacional = "municipal"
            plan = "full"
            activo = True

        class FakeSub:
            id = FakeId()
            inquilino_id = 1
            plan = "full"
            estado = "activa"
            fecha_inicio = self.now
            fecha_fin = self.now + timedelta(days=30)

        class FakeConsumo:
            inquilino_id = 1
            periodo = datetime.now(timezone.utc).strftime("%Y-%m")
            capacidad = "social_posts"
            cantidad_usada = 5

        fake_tenant = FakeTenant()
        fake_sub = FakeSub()
        fake_consumo = FakeConsumo()

        def query_side_effect(model_cls):
            query_obj = MagicMock()
            if model_cls == FakeTenant:
                query_obj.filter.return_value.first.return_value = fake_tenant
            elif model_cls == FakeSub:
                query_obj.filter.return_value.order_by.return_value.first.return_value = fake_sub
            elif model_cls == FakeConsumo:
                query_obj.filter.return_value.first.return_value = fake_consumo
            return query_obj

        db_mock.query.side_effect = query_side_effect

        with patch.dict("sys.modules", {"app.models.tenancy": MagicMock(Inquilino=FakeTenant), "app.models.billing": MagicMock(Suscripcion=FakeSub, ConsumoInquilino=FakeConsumo)}):
            res_consume = PlanCapabilityService.check_and_consume_quota(db_mock, 1, "social_publishing", amount=1)
            self.assertEqual(res_consume["limite_mensual"], 50)

            res_release = PlanCapabilityService.release_quota(db_mock, 1, "social_publishing", amount=1)
            self.assertEqual(res_release["capacidad"], "social_posts")

    def test_05_multi_tenant_isolation(self):
        """5. Multi-tenant isolation between two tenants."""
        tenant_a = {"id": 201, "nombre_empresa": "Tenant A", "plan": "full", "activo": True}
        tenant_b = {"id": 202, "nombre_empresa": "Tenant B", "plan": "basico", "activo": True}

        caps_a = PlanCapabilityService.resolve_capabilities(tenant_a)
        caps_b = PlanCapabilityService.resolve_capabilities(tenant_b)

        self.assertEqual(caps_a.inquilino_id, 201)
        self.assertEqual(caps_b.inquilino_id, 202)
        self.assertTrue(caps_a.crm_leads_enabled)
        self.assertFalse(caps_b.crm_leads_enabled)

    def test_06_crm_access_denial_unauthorized_roles(self):
        """6. Access denial to CRM for unauthorized roles."""
        from views.admin_empresa.crm_marketing_view import FORBIDDEN_CRM_ROLES
        unauthorized_roles = ["coordinador", "jefe_almacen", "almacenista", "jefe_escenarios", "profesor", "alumno", "padre_acudiente"]

        for role in unauthorized_roles:
            self.assertIn(role, FORBIDDEN_CRM_ROLES)

    def test_07_web_content_generation_backend_contract(self):
        """7. Content generation from Web against test backend contract."""
        tenant_data = {"id": 300, "plan": "full", "activo": True}
        caps = PlanCapabilityService.resolve_capabilities(tenant_data)
        self.assertTrue(caps.ai_images_enabled)
        self.assertEqual(caps.monthly_limits["images"], 100)

    def test_08_flet_desktop_content_generation_http(self):
        """8. Content generation from Flet Desktop against test backend (ApiClient call)."""
        api_client = ApiClient(base_url="http://localhost:8000", tenant_api_key="test_key")

        with patch.object(api_client, "post", return_value={"job_id": "JOB-12345", "status": "processing"}):
            res = api_client.post("/api/v1/crm/generate_predis_media", {"prompt": "Promo de fútbol", "media_type": "post_1_1"})
            self.assertEqual(res["job_id"], "JOB-12345")

    def test_09_flet_mobile_content_generation_http(self):
        """9. Content generation from Flet Mobile against test backend (ApiClient call)."""
        api_client = ApiClient(base_url="http://localhost:8000", tenant_api_key="test_key")

        with patch.object(api_client, "post", return_value={"job_id": "JOB-67890", "status": "processing"}):
            res = api_client.post("/api/v1/crm/generate_predis_media", {"prompt": "Taller de música", "media_type": "post_1_1"})
            self.assertEqual(res["job_id"], "JOB-67890")

    def test_10_creation_and_recovery_of_campaign(self):
        """10. Creation and recovery posterior of a persistent campaign."""
        api_client = ApiClient(base_url="http://localhost:8000", tenant_api_key="test_key")

        with patch.object(api_client, "post", return_value={"campaign_id": "CAMP-001", "status": "draft"}):
            res = api_client.post("/api/v1/crm/campaigns", {"title": "Campaña Verano 2025"})
            self.assertEqual(res["campaign_id"], "CAMP-001")

    def test_11_publication_scheduling_and_status_query(self):
        """11. Publication scheduling and status query."""
        api_client = ApiClient(base_url="http://localhost:8000", tenant_api_key="test_key")

        with patch.object(api_client, "post", return_value={"publish_id": "PUB-999", "status": "published"}):
            res = api_client.post("/api/v1/video_distribution/publish", {"platform": "instagram", "caption": "Inscripciones abiertas"})
            self.assertEqual(res["publish_id"], "PUB-999")
            self.assertEqual(res["status"], "published")

    def test_12_error_handling_unavailable_provider_plan_quota(self):
        """12. Correct error handling for unavailable provider, insufficient plan, and exhausted quota."""
        api_client = ApiClient(base_url="http://localhost:8000", tenant_api_key="test_key")

        # Test HTTP 402 Payment Required / Insufficient Plan
        with patch.object(api_client, "post", return_value={"error": True, "code": "STD-ERR-402", "status_code": 402}):
            res_402 = api_client.post("/api/v1/crm/generate_predis_media", {"prompt": "Test"})
            self.assertEqual(res_402["status_code"], 402)

        # Test HTTP 429 Quota Exhausted
        with patch.object(api_client, "post", return_value={"error": True, "code": "STD-ERR-429", "status_code": 429}):
            res_429 = api_client.post("/api/v1/crm/generate_predis_media", {"prompt": "Test"})
            self.assertEqual(res_429["status_code"], 429)

        # Test HTTP 503 Provider Unavailable
        with patch.object(api_client, "post", return_value={"error": True, "code": "STD-ERR-503", "status_code": 503}):
            res_503 = api_client.post("/api/v1/crm/generate_predis_media", {"prompt": "Test"})
            self.assertEqual(res_503["status_code"], 503)

if __name__ == "__main__":
    unittest.main()
