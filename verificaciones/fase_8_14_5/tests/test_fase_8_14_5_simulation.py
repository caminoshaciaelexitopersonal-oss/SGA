"""
Comprehensive End-to-End Simulation Test Suite for Phase 8.14.5.
Tests AIRouter, Open Generative AI, SkyReels-V2, GPU Lifecycle, CRM Media Workflow, and Multi-Tenant Isolation.
"""
import unittest
import sys
import os
import json
import time

sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')

from app.services.ai_router import ai_router
from app.services.gpu_lifecycle_service import gpu_lifecycle_service
from app.services.skyreels_service import skyreels_service

class TestPhase8145Simulation(unittest.TestCase):
    def setUp(self):
        self.test_tenant_a = 501
        self.test_tenant_b = 502

    def test_01_admin_general_provider_supervision(self):
        """Simulates Admin General AI provider telemetry & health checks."""
        registry = ai_router.describe_capabilities_registry()
        self.assertEqual(registry["router_version"], "Universal-2.0")
        self.assertIn("text_generation", registry["capabilities"])
        self.assertIn("image_generation", registry["capabilities"])
        self.assertIn("video_generation", registry["capabilities"])

    def test_02_crm_text_script_generation_flow(self):
        """Simulates CRM script generation request for a campaign."""
        res = ai_router.route_request("text", {"prompt": "Guion promocional escuela de Taekwondo"}, inquilino_id=self.test_tenant_a)
        self.assertIn(res["status"], ["success", "fallback"])
        self.assertIn("text", res)

    def test_03_crm_image_asset_creation_open_gen_ai(self):
        """Simulates Open Generative AI image asset creation and persistent path assignment."""
        res = ai_router.route_request("image", {"prompt": "Poster artes marciales", "format": "post_1_1"}, inquilino_id=self.test_tenant_a)
        self.assertEqual(res["status"], "success")
        self.assertIn("open_generative_ai", res["provider"])
        self.assertTrue(res["image_url"].startswith("/assets/generated/"))

    def test_04_crm_video_asset_creation_basic_plan_rejected(self):
        """Simulates CRM video creation attempt by Plan Básico user -> Rejection."""
        res = ai_router.route_request("video", {"prompt": "Video promo"}, inquilino_id=self.test_tenant_a, plan_type="basico")
        self.assertEqual(res["status"], "quota_exceeded")
        self.assertEqual(res["reason"], "plan_restricted")

    def test_05_crm_video_asset_creation_full_plan_authorized(self):
        """Simulates CRM video creation by Plan Full user -> On-Demand GPU Activation & Job Queued."""
        res = ai_router.route_request("video", {"prompt": "Video promo alta resolución"}, inquilino_id=self.test_tenant_a, plan_type="full")
        self.assertEqual(res["status"], "queued")
        self.assertTrue(res["job_id"].startswith("skyreels_"))
        self.assertEqual(res["gpu_activation_status"], "online")

    def test_06_multi_tenant_isolation_job_query_forbidden(self):
        """Simulates Tenant B trying to access Tenant A's video generation job -> Forbidden."""
        job = skyreels_service.submit_video_job("Video privado Tenant A", "reel_9_16", inquilino_id=self.test_tenant_a)
        job_id = job["job_id"]

        # Tenant A (Owner) query
        st_a = skyreels_service.get_job_status(job_id, requester_inquilino_id=self.test_tenant_a)
        self.assertNotEqual(st_a["status"], "forbidden")

        # Tenant B (Attacker) query
        st_b = skyreels_service.get_job_status(job_id, requester_inquilino_id=self.test_tenant_b)
        self.assertEqual(st_b["status"], "forbidden")

    def test_07_gpu_lifecycle_idle_shutdown(self):
        """Simulates idle GPU worker auto-shutdown after inactivity when no active jobs exist."""
        gpu_lifecycle_service._active_jobs.clear()  # Clear pending test jobs to simulate idle
        gpu_lifecycle_service.request_gpu_activation("test_user")
        gpu_lifecycle_service._last_activity_at = time.time() - 400.0  # 400s > 300s grace
        shutdown_res = gpu_lifecycle_service.evaluate_auto_shutdown(grace_period_seconds=300.0)
        self.assertEqual(shutdown_res["action"], "shutdown_executed")
        self.assertEqual(shutdown_res["worker_state"], "off")

if __name__ == "__main__":
    unittest.main()
