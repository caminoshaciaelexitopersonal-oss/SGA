import os
import sys
import unittest
from playwright.sync_api import sync_playwright

class TestMarketingSyncPlaywright(unittest.TestCase):

    def test_marketing_plans_sync_and_screenshot(self):
        output_dir = "/home/jules/verification"
        os.makedirs(output_dir, exist_ok=True)
        screenshot_path = os.path.join(output_dir, "marketing_plans_sync.png")

        index_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "SGA-CD-WEB.git", "index.html"))
        file_url = f"file://{index_file}"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            page.goto(file_url)

            # Esperar a que los elementos del DOM y el grid de precios estén presentes
            page.wait_for_selector("#planes", timeout=10000)
            page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            page.wait_for_timeout(1000)

            # Captura de pantalla para verificación visual de la Fase 7.2
            page.screenshot(path=screenshot_path, full_page=False)
            browser.close()

        self.assertTrue(os.path.exists(screenshot_path), "La captura de pantalla marketing_plans_sync.png debe ser generada")
        print(f"[Playwright] Verification screenshot generated at: {screenshot_path}")

if __name__ == "__main__":
    unittest.main()
