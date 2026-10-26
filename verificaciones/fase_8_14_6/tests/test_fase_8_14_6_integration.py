"""
Comprehensive End-to-End Integration Test Suite for Phase 8.14.6.
Tests Admin General Supervision, Admin Empresa CRM Workflows,
Open Generative AI, SkyReels-V2, GPU Lifecycle, and Multi-Tenant Isolation.
"""
import unittest
import sys
import os
import time

sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')

from app.services.ai_router import ai_router
from app.services.gpu_lifecycle_service import gpu_lifecycle_service
from app.services.skyreels_service import skyreels_service

class TestPhase8146Integration(unittest.TestCase):
    def setUp(self):
        self.tenant_alpha = 601
        self.tenant_beta = 602

    def test_01_admin_general_global_provider_telemetry(self):
        """Validates Admin General global provider status and modality registry."""
        registry = ai_router.describe_capabilities_registry()
        self.assertEqual(registry["router_version"], "Universal-2.0")
        self.assertIn("capabilities", registry)
        caps = registry["capabilities"]
        self.assertIn("text_generation", caps)
        self.assertIn("image_generation", caps)
        self.assertIn("video_generation", caps)

    def test_02_admin_empresa_crm_script_generation(self):
        """Validates Admin Empresa CRM script generation dispatch."""
        res = ai_router.route_request("text", {"prompt": "Guion promocional escuela deportiva"}, inquilino_id=self.tenant_alpha)
        self.assertIn(res["status"], ["success", "fallback"])
        self.assertIn("text", res)

    def test_03_admin_empresa_crm_image_generation_open_gen_ai(self):
        """Validates Open Generative AI image generation and persistent path assignment."""
        res = ai_router.route_request("image", {"prompt": "Poster artes marciales", "format": "post_1_1"}, inquilino_id=self.tenant_alpha)
        self.assertEqual(res["status"], "success")
        self.assertIn("open_generative_ai", res["provider"])
        self.assertTrue(res["image_url"].startswith("/assets/generated/"))

    def test_04_crm_video_basic_plan_restriction(self):
        """Validates Plan Básico GPU restriction when attempting video generation."""
        res = ai_router.route_request("video", {"prompt": "Video promocional"}, inquilino_id=self.tenant_alpha, plan_type="basico")
        self.assertEqual(res["status"], "quota_exceeded")
        self.assertEqual(res["reason"], "plan_restricted")

    def test_05_crm_video_full_plan_quota_and_gpu_boot(self):
        """Validates Plan Full authorized video generation with on-demand GPU activation."""
        res = ai_router.route_request("video", {"prompt": "Video promocional HD"}, inquilino_id=self.tenant_alpha, plan_type="full")
        self.assertEqual(res["status"], "queued")
        self.assertTrue(res["job_id"].startswith("skyreels_"))
        self.assertEqual(res["gpu_activation_status"], "online")

    def test_06_multi_tenant_negative_isolation(self):
        """Negative test: Tenant Beta attempting to access Tenant Alpha's job -> Forbidden."""
        job = skyreels_service.submit_video_job("Video privado Tenant Alpha", "reel_9_16", inquilino_id=self.tenant_alpha)
        job_id = job["job_id"]

        # Authorized query (Tenant Alpha)
        st_alpha = skyreels_service.get_job_status(job_id, requester_inquilino_id=self.tenant_alpha)
        self.assertNotEqual(st_alpha["status"], "forbidden")

        # Forbidden query (Tenant Beta)
        st_beta = skyreels_service.get_job_status(job_id, requester_inquilino_id=self.tenant_beta)
        self.assertEqual(st_beta["status"], "forbidden")
        self.assertIn("Acceso denegado", st_beta["error"])

    def test_07_gpu_lifecycle_safe_auto_shutdown(self):
        """Validates idle GPU auto-shutdown after 300s grace period when no active jobs exist."""
        gpu_lifecycle_service._active_jobs.clear()
        gpu_lifecycle_service.request_gpu_activation("admin_user")
        gpu_lifecycle_service._last_activity_at = time.time() - 400.0  # 400s > 300s grace

        res = gpu_lifecycle_service.evaluate_auto_shutdown(grace_period_seconds=300.0)
        self.assertEqual(res["action"], "shutdown_executed")
        self.assertEqual(res["worker_state"], "off")

if __name__ == "__main__":
    unittest.main()
