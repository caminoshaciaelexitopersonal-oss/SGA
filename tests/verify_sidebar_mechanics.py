import os
import time
from playwright.sync_api import sync_playwright

def verify_sidebar_mechanics():
    os.makedirs('/home/jules/verification', exist_ok=True)

    jwt_admin = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbl9nZW5lcmFsIiwicm9sZXMiOlsidmFsaWRfcm9sZSJdLCJpbnF1aWxpbm9faWQiOjEsImV4cCI6MjUyNDYwODAwMH0.signature"
    web_app = os.path.abspath('SGA-CD-WEB.git/app.html')

    mock_script = """
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
        };
    """

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Desktop Expanded Metallic Sidebar Screenshot
        ctx1 = browser.new_context(viewport={"width": 1440, "height": 900})
        ctx1.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_admin}');
            localStorage.setItem('userRoles', JSON.stringify(['admin_general']));
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Super Admin');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
            {mock_script}
        """)
        p1 = ctx1.new_page()
        p1.goto(f'file://{web_app}')
        time.sleep(1.0)

        shot1 = '/home/jules/verification/sidebar_expanded_metallic.png'
        p1.screenshot(path=shot1, full_page=True)
        print(f"[Screenshot Created] {shot1}")

        # 2. Desktop Collapsed Micro-Icons Sidebar Screenshot
        p1.click('#sidebar-toggle-btn')
        time.sleep(1.0)
        shot2 = '/home/jules/verification/sidebar_collapsed_icons.png'
        p1.screenshot(path=shot2, full_page=True)
        print(f"[Screenshot Created] {shot2}")

        # 3. Mobile Hamburger Drawer Viewport Screenshot
        ctx2 = browser.new_context(viewport={"width": 375, "height": 812}) # iPhone X viewport
        ctx2.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_admin}');
            localStorage.setItem('userRoles', JSON.stringify(['admin_general']));
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Super Admin');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
            {mock_script}
        """)
        p2 = ctx2.new_page()
        p2.goto(f'file://{web_app}')
        time.sleep(1.0)

        # Open mobile hamburger menu
        p2.click('#mobile-hamburger-btn')
        time.sleep(1.0)

        shot3 = '/home/jules/verification/sidebar_mobile_hamburger.png'
        p2.screenshot(path=shot3, full_page=True)
        print(f"[Screenshot Created] {shot3}")

        browser.close()

if __name__ == '__main__':
    verify_sidebar_mechanics()
