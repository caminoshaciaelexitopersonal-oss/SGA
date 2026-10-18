import os
import unittest
from playwright.sync_api import sync_playwright

class TestPhase8DashboardsPlaywright(unittest.TestCase):

    def test_secure_login_shield_and_powerbi_dashboard(self):
        output_dir = "/home/jules/verification"
        os.makedirs(output_dir, exist_ok=True)

        login_screenshot = os.path.join(output_dir, "secure_login_shield.png")
        dashboard_screenshot = os.path.join(output_dir, "dashboard_powerbi_style.png")

        login_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "SGA-CD-WEB.git", "login.html"))
        app_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "SGA-CD-WEB.git", "app.html"))

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # 1. Verificación Visual de Login Shield
            page_login = browser.new_page(viewport={"width": 1280, "height": 800})
            page_login.goto(f"file://{login_file}")
            page_login.wait_for_selector("#login-form", timeout=10000)
            page_login.screenshot(path=login_screenshot)
            print(f"[Playwright] Login shield screenshot generated at: {login_screenshot}")

            # 2. Verificación Visual de Dashboard Power BI Style
            page_app = browser.new_page(viewport={"width": 1280, "height": 900})
            page_app.goto(f"file://{app_file}")
            page_app.wait_for_timeout(1500)
            page_app.screenshot(path=dashboard_screenshot, full_page=False)
            print(f"[Playwright] Power BI dashboard screenshot generated at: {dashboard_screenshot}")

            browser.close()

        self.assertTrue(os.path.exists(login_screenshot), "secure_login_shield.png debe existir")
        self.assertTrue(os.path.exists(dashboard_screenshot), "dashboard_powerbi_style.png debe existir")

if __name__ == "__main__":
    unittest.main()
