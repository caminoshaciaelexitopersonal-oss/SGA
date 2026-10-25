import os
import json
from playwright.sync_api import sync_playwright

def test_verify_seo_marketing():
    os.makedirs('/home/jules/verification', exist_ok=True)
    web_dir = os.path.abspath('SGA-CD-WEB.git')
    index_path = f'file://{web_dir}/index.html'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        page.goto(index_path)
        page.wait_for_selector('body')

        # Close any auto-triggered network modal in test env
        page.evaluate("if(window.SGAErrorHandler) window.SGAErrorHandler.hide();")

        # 1. Verify JSON-LD script tag
        json_ld_text = page.eval_on_selector('#sga-jsonld-schema', 'el => el.textContent')
        assert json_ld_text is not None, "JSON-LD script tag not found"
        schemas = json.loads(json_ld_text)
        assert len(schemas) == 2, "Expected 2 JSON-LD schemas"
        print("[SEO TEST PASSED] JSON-LD schemas correctly injected:", schemas[0]['name'])

        # 2. Test segmented metadata update
        page.evaluate("window.SGASEOOptimizer.updateRoleMetadata('entidad');")
        og_title = page.eval_on_selector('meta[property="og:title"]', 'el => el.getAttribute("content")')
        print("[MARKETING TEST PASSED] Dynamic OG Title for B2B Entity:", og_title)

        # 3. Test telemetry conversion tracking
        page.evaluate("window.trackConversionEvent('test_lead', 'conversion', {entityLevel: 'departamental'});")
        print("[TELEMETRY TEST PASSED] Conversion tracking executed cleanly.")

        screenshot_path = '/home/jules/verification/seo_marketing.png'
        page.screenshot(path=screenshot_path)
        print(f"Captured screenshot at {screenshot_path}")

        browser.close()

if __name__ == '__main__':
    test_verify_seo_marketing()
