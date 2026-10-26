"""
Comprehensive Test Suite for Universal AI Router (Phase 8.13.9).
"""
import unittest
import sys
sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')

from app.services.ai_router import ai_router, AIRouterService

class TestUniversalAIRouterSuite(unittest.TestCase):
    def test_01_describe_capabilities_registry(self):
        reg = ai_router.describe_capabilities_registry()
        self.assertEqual(reg["router_version"], "Universal-2.0")
        self.assertIn("capabilities", reg)
        caps = reg["capabilities"]
        self.assertIn("text_generation", caps)
        self.assertIn("image_generation", caps)
        self.assertIn("video_generation", caps)

    def test_02_route_text_task_fallback(self):
        res = ai_router.route_request("text", {"prompt": "Generar guion deportivo"}, inquilino_id=1)
        self.assertEqual(res["status"], "fallback")
        self.assertEqual(res["provider"], "sga_cd_ai_router")

    def test_03_route_video_task_plan_basic_denied(self):
        res = ai_router.route_request("video", {"prompt": "Video promo"}, inquilino_id=10, plan_type="basico")
        self.assertEqual(res["status"], "quota_exceeded")
        self.assertEqual(res["reason"], "plan_restricted")

    def test_04_route_video_task_plan_full_authorized(self):
        res = ai_router.route_request("video", {"prompt": "Video promo"}, inquilino_id=20, plan_type="full")
        self.assertEqual(res["status"], "queued")
        self.assertTrue(res["job_id"].startswith("skyreels_"))

    def test_05_route_unknown_task_type(self):
        res = ai_router.route_request("unknown_task", {}, inquilino_id=1)
        self.assertEqual(res["status"], "error")
        self.assertIn("no reconocido", res["error"])

if __name__ == "__main__":
    unittest.main()
