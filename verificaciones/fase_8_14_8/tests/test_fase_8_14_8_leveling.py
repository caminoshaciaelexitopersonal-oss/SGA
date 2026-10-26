"""
Suite de Pruebas FASE 8.14.8 — Nivelación Transversal de Derechos Comerciales y
Simulación Funcional Multitanante en SGA-CD.

Evalúa los 12 escenarios de combinaciones B2B (4 Naturalezas Jurídicas x 3 Alcances Territoriales),
validando que Plan Full habilita el 100% de capacidades avanzadas y cuotas cuantitativas,
mientras Plan Básico restringe el acceso adecuadamente.
"""
import sys
import os
import unittest
from datetime import datetime, timezone

# Ensure SGA-CD-FASTAPI-BACKEND is in Python path
sys.path.insert(0, os.path.abspath("SGA-CD-FASTAPI-BACKEND"))

from app.services.plan_capability_service import (
    PlanCapabilityService,
    CANONICAL_BASIC,
    CANONICAL_FULL,
    FULL_QUOTAS,
    BASIC_QUOTAS
)
from app.services.gpu_lifecycle_service import GPULifecycleService
from app.services.ai_router import ai_router


class TestFase8148Leveling(unittest.TestCase):

    def setUp(self):
        self.natures = ["entidad_publica", "empresa_privada", "organizacion_no_lucrativa", "asociacion_club"]
        self.scopes = ["municipal", "departamental", "nacional"]

    def test_01_b2b_12_combinations_plan_full(self):
        """Verifica que las 12 combinaciones B2B con Plan Full tengan 100% capacidades avanzadas activas."""
        count = 0
        for nature in self.natures:
            for scope in self.scopes:
                count += 1
                tenant_data = {
                    "id": count,
                    "nombre_empresa": f"Org_{nature}_{scope}",
                    "tipo_organizacion": nature,
                    "ambito_organizacional": scope,
                    "vocacion_institucional": "deportiva" if count % 2 != 0 else "cultural",
                    "plan": "full",
                    "activo": True
                }
                sub_data = {
                    "estado": "activa",
                    "fecha_fin": "2030-12-31T23:59:59Z"
                }
                caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)

                self.assertTrue(caps.is_active, f"Tenant {count} debe estar activo")
                self.assertEqual(caps.canonical_plan, CANONICAL_FULL)
                self.assertEqual(caps.subscription_status, "activa")

                # Verify all advanced modules are enabled
                self.assertTrue(caps.crm_leads_enabled, f"CRM Leads falló en {nature}-{scope}")
                self.assertTrue(caps.crm_campaigns_enabled, f"CRM Campaigns falló en {nature}-{scope}")
                self.assertTrue(caps.ai_images_enabled, f"AI Images falló en {nature}-{scope}")
                self.assertTrue(caps.ai_carousels_enabled, f"AI Carousels falló en {nature}-{scope}")
                self.assertTrue(caps.ai_video_enabled, f"AI Video falló en {nature}-{scope}")
                self.assertTrue(caps.ai_reels_enabled, f"AI Reels falló en {nature}-{scope}")
                self.assertTrue(caps.social_publishing_enabled, f"Social Publishing falló en {nature}-{scope}")
                self.assertTrue(caps.crm_analytics_enabled, f"CRM Analytics falló en {nature}-{scope}")

                # Verify quantitative limits match FULL_QUOTAS
                self.assertEqual(caps.monthly_limits["images"], FULL_QUOTAS["images"])
                self.assertEqual(caps.monthly_limits["carousels"], FULL_QUOTAS["carousels"])
                self.assertEqual(caps.monthly_limits["videos"], FULL_QUOTAS["videos"])
                self.assertEqual(caps.monthly_limits["reels"], FULL_QUOTAS["reels"])
                self.assertEqual(caps.monthly_limits["llm_prompts"], FULL_QUOTAS["llm_prompts"])
                self.assertEqual(caps.monthly_limits["social_posts"], FULL_QUOTAS["social_posts"])

        self.assertEqual(count, 12, "Deben haberse verificado exactamente 12 combinaciones B2B")

    def test_02_b2b_12_combinations_plan_basico(self):
        """Verifica que las 12 combinaciones B2B con Plan Básico tengan módulos avanzados bloqueados."""
        count = 0
        for nature in self.natures:
            for scope in self.scopes:
                count += 1
                tenant_data = {
                    "id": count + 100,
                    "nombre_empresa": f"Org_Basica_{nature}_{scope}",
                    "tipo_organizacion": nature,
                    "ambito_organizacional": scope,
                    "vocacion_institucional": "cultural",
                    "plan": "basico",
                    "activo": True
                }
                sub_data = {"estado": "en_prueba", "fecha_fin": "2030-12-31T23:59:59Z"}
                caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)

                self.assertTrue(caps.is_active)
                self.assertEqual(caps.canonical_plan, CANONICAL_BASIC)

                # Base modules active
                self.assertTrue(caps.panel_institucional_enabled)
                self.assertTrue(caps.gestion_usuarios_enabled)
                self.assertTrue(caps.modulos_deportivos_culturales_enabled)

                # Advanced modules blocked
                self.assertFalse(caps.crm_leads_enabled)
                self.assertFalse(caps.crm_campaigns_enabled)
                self.assertFalse(caps.ai_images_enabled)
                self.assertFalse(caps.ai_video_enabled)
                self.assertFalse(caps.social_publishing_enabled)

                # Quotas must be zero
                self.assertEqual(caps.monthly_limits["images"], 0)
                self.assertEqual(caps.monthly_limits["videos"], 0)

        self.assertEqual(count, 12)

    def test_03_gpu_lifecycle_quota_integration(self):
        """Verifica la integración entre GPULifecycleService y la política de cuotas."""
        gpu_service = GPULifecycleService()

        # Tenant 1: Plan Full -> Check quota (20h allowed)
        quota_full = gpu_service.check_tenant_quota(inquilino_id=10, plan_type="full")
        self.assertTrue(quota_full["authorized"])
        self.assertEqual(quota_full["max_hours"], 20.0)

        res_full = gpu_service.request_gpu_activation(requester_id="tenant_10")
        self.assertEqual(res_full["status"], "online")

        # Tenant 2: Plan Básico -> Denied GPU access
        quota_basic = gpu_service.check_tenant_quota(inquilino_id=20, plan_type="basico")
        self.assertFalse(quota_basic["authorized"])
        self.assertEqual(quota_basic["reason"], "plan_restricted")

    def test_04_universal_ai_router_multitenant_dispatch(self):
        """Verifica el despacho multitanante en el Router IA Universal."""
        result_text = ai_router.route_request(
            task_type="text",
            payload={"prompt": "Generar plan de entrenamiento de fútbol para categoría juvenil"},
            inquilino_id=5,
            plan_type="full"
        )
        self.assertIsNotNone(result_text)
        # In headless environment without active LLM daemons, fallback mode is returned cleanly
        self.assertIn(result_text["status"], ["success", "fallback"])

        result_img = ai_router.route_request(
            task_type="image",
            payload={"prompt": "Diseñar póster promocional de torneo cultural"},
            inquilino_id=5,
            plan_type="full"
        )
        self.assertIn(result_img["status"], ["success", "fallback"])

    def test_05_expired_subscription_blocks_capabilities(self):
        """Verifica que una suscripción vencida bloquee las capacidades avanzadas de Plan Full."""
        tenant_data = {
            "id": 99,
            "nombre_empresa": "Club Vencido",
            "plan": "full",
            "activo": True
        }
        sub_data = {
            "estado": "vencida",
            "fecha_fin": "2020-01-01T00:00:00Z"
        }
        caps = PlanCapabilityService.resolve_capabilities(tenant_data, sub_data)
        self.assertFalse(caps.is_active)
        self.assertFalse(caps.ai_video_enabled)
        self.assertEqual(caps.monthly_limits["videos"], 0)


if __name__ == "__main__":
    unittest.main()
