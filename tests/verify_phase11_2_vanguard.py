import os
import time
from playwright.sync_api import sync_playwright

def verify_phase11_2_vanguard():
    os.makedirs('/home/jules/verification', exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        web_root = os.path.abspath('SGA-CD-WEB.git/index.html')
        page.goto(f'file://{web_root}')
        time.sleep(2)

        # 1. Capture Multi-Photo Cards (5 photos micro-carousel)
        monitor_section = page.locator('#monitor-vivo')
        monitor_section.scroll_into_view_if_needed()
        time.sleep(1)
        page.screenshot(path='/home/jules/verification/vanguard_multi_photo_cards.png')
        print("[Screenshot Created] /home/jules/verification/vanguard_multi_photo_cards.png")

        # 2. Capture Corporate Allies Matrix
        allies_section = page.locator('#partners')
        allies_section.scroll_into_view_if_needed()
        time.sleep(1)
        page.screenshot(path='/home/jules/verification/vanguard_corporate_allies.png')
        print("[Screenshot Created] /home/jules/verification/vanguard_corporate_allies.png")

        # 3. Capture Admin Territorial Control Panel
        admin_section = page.locator('#admin-territorial-control')
        admin_section.scroll_into_view_if_needed()
        time.sleep(1)

        # Trigger admin asset sync
        page.click('#admin-asset-form button[type="submit"]')
        time.sleep(1)
        page.screenshot(path='/home/jules/verification/vanguard_admin_control_panel.png')
        print("[Screenshot Created] /home/jules/verification/vanguard_admin_control_panel.png")

        # 4. Capture Crossplatform Flet Sync View (Mobile Viewport 375x812)
        mobile_page = browser.new_page(viewport={"width": 375, "height": 812})
        mobile_page.goto(f'file://{web_root}')
        time.sleep(2)
        mobile_page.screenshot(path='/home/jules/verification/vanguard_flet_crossplatform_sync.png')
        print("[Screenshot Created] /home/jules/verification/vanguard_flet_crossplatform_sync.png")

        browser.close()

if __name__ == '__main__':
    verify_phase11_2_vanguard()
