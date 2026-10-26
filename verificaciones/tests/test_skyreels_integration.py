"""
Unit tests for SkyReels-V2 AI Video Generation Adapter.
"""
import unittest
import time
import sys
sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')

from app.services.skyreels_service import SkyReelsV2Service

class TestSkyReelsV2Adapter(unittest.TestCase):
    def setUp(self):
        self.service = SkyReelsV2Service(endpoint_url="http://localhost:8090")

    def test_prerequisites_check_schema(self):
        res = self.service.check_prerequisites()
        self.assertEqual(res["adapter"], "SkyReels-V2")
        self.assertIn("cuda_available", res)
        self.assertIn("vram_gb", res)
        self.assertIn("ready_for_local_inference", res)

    def test_submit_and_poll_job(self):
        job = self.service.submit_video_job(
            prompt="Video de prueba de Taekwondo",
            format_type="reel_9_16",
            inquilino_id=10
        )
        self.assertEqual(job["status"], "queued")
        self.assertTrue(job["job_id"].startswith("skyreels_"))

        # Poll job status
        status_data = self.service.get_job_status(job["job_id"])
        self.assertIn(status_data["status"], ["queued", "processing", "completed"])
        self.assertEqual(status_data["inquilino_id"], 10)

    def test_unknown_job_id_returns_not_found(self):
        status_data = self.service.get_job_status("non_existent_job_123")
        self.assertEqual(status_data["status"], "not_found")

if __name__ == '__main__':
    unittest.main()
