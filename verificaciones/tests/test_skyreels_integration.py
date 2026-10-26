"""
Expanded Unit & Integration Test Suite for SkyReels-V2 Distributed Adapter.
"""
import unittest
import time
import os
import sys
sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')

from app.services.skyreels_service import SkyReelsV2Service

class TestSkyReelsV2DistributedSuite(unittest.TestCase):
    def setUp(self):
        self.temp_dir = "verificaciones/temp_generated_test"
        self.service = SkyReelsV2Service(
            endpoint_url="http://localhost:8090",
            storage_dir=self.temp_dir
        )

    def tearDown(self):
        if os.path.exists(self.temp_dir):
            for f in os.listdir(self.temp_dir):
                try:
                    os.remove(os.path.join(self.temp_dir, f))
                except Exception:
                    pass
            try:
                os.rmdir(self.temp_dir)
            except Exception:
                pass

    def test_01_prerequisites_schema(self):
        prereqs = self.service.check_prerequisites()
        self.assertEqual(prereqs["adapter"], "SkyReels-V2")
        self.assertIn("remote_worker_online", prereqs)
        self.assertIn("ready_for_local_inference", prereqs)

    def test_02_submit_empty_prompt_rejected(self):
        res = self.service.submit_video_job("   ", "reel_9_16", inquilino_id=1)
        self.assertEqual(res["status"], "error")
        self.assertIn("error", res)

    def test_03_job_lifecycle_and_tenant_isolation(self):
        job = self.service.submit_video_job("Video de prueba Taekwondo", "reel_9_16", inquilino_id=10)
        self.assertEqual(job["status"], "queued")
        job_id = job["job_id"]

        # 1. Authorize tenant access
        status_authorized = self.service.get_job_status(job_id, requester_inquilino_id=10)
        self.assertIn(status_authorized["status"], ["queued", "processing", "failed"])

        # 2. Cross-tenant access attempt must return forbidden
        status_forbidden = self.service.get_job_status(job_id, requester_inquilino_id=99)
        self.assertEqual(status_forbidden["status"], "forbidden")

    def test_04_file_validation_triggers_completed_state(self):
        job = self.service.submit_video_job("Test video generation", "reel_9_16", inquilino_id=2)
        job_id = job["job_id"]

        # Create physical test file in storage dir
        filename = f"video_{job_id}.mp4"
        file_path = os.path.join(self.temp_dir, filename)
        with open(file_path, "wb") as f:
            f.write(b"\x00\x00\x00\x18ftypmp42")

        # Status check should detect physical file and mark completed
        status_res = self.service.get_job_status(job_id, requester_inquilino_id=2)
        self.assertEqual(status_res["status"], "completed")
        self.assertEqual(status_res["progress_pct"], 100)
        self.assertGreater(status_res["file_size_bytes"], 0)

    def test_05_cancel_job(self):
        job = self.service.submit_video_job("Test cancel video", "reel_9_16", inquilino_id=3)
        job_id = job["job_id"]

        # Cancel job
        cancel_res = self.service.cancel_job(job_id, requester_inquilino_id=3)
        self.assertEqual(cancel_res["status"], "cancelled")

        # Verify status is cancelled
        status_res = self.service.get_job_status(job_id, requester_inquilino_id=3)
        self.assertEqual(status_res["status"], "cancelled")

if __name__ == "__main__":
    unittest.main()
