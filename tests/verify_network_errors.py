import os
import time
from playwright.sync_api import sync_playwright

def test_verify_all_http_errors():
    os.makedirs('/home/jules/verification/errors', exist_ok=True)
    web_dir = os.path.abspath('SGA-CD-WEB.git')
    index_path = f'file://{web_dir}/index.html'

    status_codes = [400, 401, 403, 404, 405, 408, 429, 500, 502, 503, 504]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto(index_path)
        page.wait_for_selector('body')

        for code in status_codes:
            # Trigger SGAErrorHandler.handleHTTPError(code)
            page.evaluate(f"window.SGAErrorHandler.handleHTTPError({code});")
            time.sleep(0.5) # Allow GSAP animation to complete

            screenshot_path = f'/home/jules/verification/errors/err_{code}.png'
            page.screenshot(path=screenshot_path)
            print(f"Captured screenshot for HTTP {code} at {screenshot_path}")

            # Close modal
            page.evaluate("window.SGAErrorHandler.hide();")
            time.sleep(0.3)

        browser.close()

if __name__ == '__main__':
    test_verify_all_http_errors()
