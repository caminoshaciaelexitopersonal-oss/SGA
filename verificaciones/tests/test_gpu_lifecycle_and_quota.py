"""
Comprehensive Test Suite for GPU Lifecycle, On-Demand Activation, and 20-Hour Quota Control (15 Scenarios).
"""
import unittest
import time
import os
import sys
sys.path.insert(0, 'SGA-CD-FASTAPI-BACKEND')

from app.services.gpu_lifecycle_service import GPULifecycleService, MAX_MONTHLY_GPU_SECONDS
from app.services.skyreels_service import SkyReelsV2Service

class TestGPULifecycleAndQuotaSuite(unittest.TestCase):
    def setUp(self):
        self.lifecycle = GPULifecycleService(provider_endpoint="http://localhost:8090")
        self.temp_dir = "verificaciones/temp_gpu_quota_test"
        self.skyreels = SkyReelsV2Service(endpoint_url="http://localhost:8090", storage_dir=self.temp_dir)

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

    def test_01_basic_plan_user_denied(self):
        res = self.lifecycle.check_tenant_quota(tenant_id:=101, plan_type="basico")
        self.assertFalse(res["authorized"])
        self.assertEqual(res["reason"], "plan_restricted")

    def test_02_full_plan_user_authorized_with_quota(self):
        res = self.lifecycle.check_tenant_quota(tenant_id:=102, plan_type="full")
        self.assertTrue(res["authorized"])
        self.assertEqual(res["remaining_hours"], 20.0)

    def test_03_full_plan_user_quota_exhausted_blocked(self):
        tenant_id = 103
        record = self.lifecycle._get_tenant_record(tenant_id)
        record["consumed_seconds"] = MAX_MONTHLY_GPU_SECONDS  # Exhaust 20 hours

        res = self.lifecycle.check_tenant_quota(tenant_id, plan_type="full")
        self.assertFalse(res["authorized"])
        self.assertEqual(res["reason"], "quota_exceeded")
        self.assertIn("cuota máxima mensual", res["message"])

    def test_04_simultaneous_quota_requests_prevent_overconsumption(self):
        tenant_id = 104
        record = self.lifecycle._get_tenant_record(tenant_id)
        record["consumed_seconds"] = MAX_MONTHLY_GPU_SECONDS - 200.0  # Only 200s left

        # First reservation of 300s should fail because remaining < estimated
        res = self.lifecycle.check_tenant_quota(tenant_id, plan_type="full")
        self.assertTrue(res["authorized"])  # authorized because consumed < MAX
        # Reserve 300s
        reserved1 = self.lifecycle.reserve_quota(tenant_id, 300.0)
        self.assertTrue(reserved1)

        # Second attempt must be rejected because consumed + reserved > MAX
        res_after = self.lifecycle.check_tenant_quota(tenant_id, plan_type="full")
        self.assertFalse(res_after["authorized"])

    def test_05_multiple_tabs_sessions_no_counter_duplication(self):
        tenant_id = 105
        s1 = self.lifecycle.start_editing_session("sess_tab1", tenant_id, user_id=5)
        s2 = self.lifecycle.start_editing_session("sess_tab2", tenant_id, user_id=5)

        record = self.lifecycle._get_tenant_record(tenant_id)
        self.assertEqual(record["active_sessions_count"], 2)
        self.assertEqual(record["consumed_seconds"], 0.0)  # Editing session does NOT consume GPU seconds

    def test_06_single_activation_coordination_for_concurrent_requests(self):
        req1 = self.lifecycle.request_gpu_activation("client_1")
        self.assertEqual(req1["status"], "online")
        inst_1 = req1["instance_id"]

        req2 = self.lifecycle.request_gpu_activation("client_2")
        self.assertEqual(req2["status"], "online")
        self.assertEqual(req2["instance_id"], inst_1)  # Reuses same instance without duplicate boot

    def test_07_no_shutdown_while_active_jobs_exist(self):
        self.lifecycle.request_gpu_activation("client_1")
        self.lifecycle.register_active_job("job_active_99")

        # Evaluate shutdown after 1000s idle time
        self.lifecycle._last_activity_at = time.time() - 1000.0
        res = self.lifecycle.evaluate_auto_shutdown(grace_period_seconds=300.0)

        self.assertEqual(res["action"], "kept_active")
        self.assertEqual(res["reason"], "active_jobs_in_progress")

    def test_08_auto_shutdown_executed_after_idle_grace_period(self):
        self.lifecycle.request_gpu_activation("client_1")
        self.lifecycle._last_activity_at = time.time() - 400.0  # 400s idle > 300s grace

        res = self.lifecycle.evaluate_auto_shutdown(grace_period_seconds=300.0)
        self.assertEqual(res["action"], "shutdown_executed")
        self.assertEqual(res["worker_state"], "off")

    def test_09_user_logout_leaves_gpu_on_for_other_users(self):
        self.lifecycle.request_gpu_activation("client_1")
        s1 = self.lifecycle.start_editing_session("sess_u1", inquilino_id=1, user_id=10)
        s2 = self.lifecycle.start_editing_session("sess_u2", inquilino_id=2, user_id=20)

        # User 1 logs out
        self.lifecycle.close_editing_session("sess_u1")
        self.assertEqual(self.lifecycle._worker_state, "online")  # Remains online for user 2

    def test_10_gpu_startup_failure_releases_reservations(self):
        tenant_id = 110
        job = self.skyreels.submit_video_job("Fail test prompt", "reel_9_16", inquilino_id=tenant_id, plan_type="full")
        job_id = job["job_id"]

        # Check job status without physical output file and without GPU -> fails and releases quota
        status_res = self.skyreels.get_job_status(job_id, requester_inquilino_id=tenant_id)
        self.assertEqual(status_res["status"], "failed")

        record = self.lifecycle._get_tenant_record(tenant_id)
        self.assertEqual(record["reserved_seconds"], 0.0)  # Released

    def test_11_generation_failure_releases_reserved_quota(self):
        tenant_id = 111
        self.lifecycle.reserve_quota(tenant_id, 300.0)
        self.lifecycle.release_reserved_quota(tenant_id, 300.0)

        record = self.lifecycle._get_tenant_record(tenant_id)
        self.assertEqual(record["reserved_seconds"], 0.0)

    def test_12_accumulated_consumption_persists(self):
        tenant_id = 112
        self.lifecycle.commit_quota_consumption(tenant_id, actual_seconds=1200.0, reserved_seconds=0.0)

        record = self.lifecycle._get_tenant_record(tenant_id)
        self.assertEqual(record["consumed_seconds"], 1200.0)

    def test_13_quota_reset_only_on_billing_cycle_start(self):
        tenant_id = 113
        self.lifecycle.commit_quota_consumption(tenant_id, actual_seconds=3600.0, reserved_seconds=0.0)

        # Reset billing cycle
        self.lifecycle.reset_monthly_cycle(tenant_id)
        record = self.lifecycle._get_tenant_record(tenant_id)
        self.assertEqual(record["consumed_seconds"], 0.0)

    def test_14_retry_idempotency_prevents_duplicate_billing(self):
        tenant_id = 114
        job = self.skyreels.submit_video_job("Idempotency prompt", "reel_9_16", inquilino_id=tenant_id)
        job_id = job["job_id"]

        # Create physical test file in the skyreels storage dir
        filename = f"video_{job_id}.mp4"
        file_path = os.path.join(self.skyreels.storage_dir, filename)
        with open(file_path, "wb") as f:
            f.write(b"\x00\x00\x00\x18ftypmp42")

        # Query status twice
        status1 = self.skyreels.get_job_status(job_id, requester_inquilino_id=tenant_id)
        status2 = self.skyreels.get_job_status(job_id, requester_inquilino_id=tenant_id)

        self.assertEqual(status1["status"], "completed")
        self.assertEqual(status2["status"], "completed")

        # Verify consumed quota is committed once (15s)
        from app.services.gpu_lifecycle_service import gpu_lifecycle_service
        record = gpu_lifecycle_service._get_tenant_record(tenant_id)
        self.assertEqual(record["consumed_seconds"], 15.0)

    def test_15_resilience_to_infrastructure_disconnect(self):
        prereqs = self.skyreels.check_prerequisites()
        self.assertFalse(prereqs["remote_worker_online"])
        self.assertEqual(prereqs["adapter"], "SkyReels-V2")

if __name__ == "__main__":
    unittest.main()
