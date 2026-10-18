import os
import unittest
from playwright.sync_api import sync_playwright

class TestLandingPageNoVideo(unittest.TestCase):

    def test_no_video_in_landing_page(self):
        output_dir = "/home/jules/verification"
        os.makedirs(output_dir, exist_ok=True)
        screenshot_path = os.path.join(output_dir, "landing_page_no_video.png")

        index_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "SGA-CD-WEB.git", "index.html"))
        file_url = f"file://{index_file}"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            page.goto(file_url)

            # Verificar que el reproductor de video y la sección ya no existen
            presentacion_section = page.query_selector("#presentacion")
            video_element = page.query_selector("#landing-promo-video")

            self.assertIsNone(presentacion_section, "La sección #presentacion fue removida correctamente")
            self.assertIsNone(video_element, "El elemento de video #landing-promo-video fue removido correctamente")

            # Tomar captura del hero y del monitor en vivo
            page.screenshot(path=screenshot_path)
            browser.close()

        self.assertTrue(os.path.exists(screenshot_path), "landing_page_no_video.png debe ser generado")
        print(f"[Playwright] Verified landing page without video. Screenshot saved at: {screenshot_path}")

if __name__ == "__main__":
    unittest.main()
