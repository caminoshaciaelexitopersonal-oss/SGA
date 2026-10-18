import os
import time
from playwright.sync_api import sync_playwright

def verify_phase12_crm():
    os.makedirs('/home/jules/verification', exist_ok=True)

    # Valid unexpired JWT mock for admin_general role
    valid_jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbImFkbWluX2dlbmVyYWwiXSwiaW5xdWlsaW5vX2lkIjoxLCJleHAiOjI1MjQ2MDgwMDB9.signature"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})

        # Inject localStorage state before page loads so app.js does not redirect to login.html
        context.add_init_script(f"""
            localStorage.setItem('accessToken', '{valid_jwt}');
            localStorage.setItem('userRoles', JSON.stringify(['admin_general']));
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Super Admin');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
        """)

        page = context.new_page()
        web_app = os.path.abspath('SGA-CD-WEB.git/app.html')
        page.goto(f'file://{web_app}')

        # Directly render Admin General view with embedded CRM
        page.evaluate(f"""() => {{
            if (typeof renderAdminGeneralDashboardView === 'function') {{
                renderAdminGeneralDashboardView('{valid_jwt}');
            }}
        }}""")
        time.sleep(2)

        # Take screenshot of embedded CRM Admin General Dashboard
        screenshot_path = '/home/jules/verification/crm_embedded_admin_general.png'
        page.screenshot(path=screenshot_path)
        print(f"[Screenshot Created] {screenshot_path}")

        browser.close()

if __name__ == '__main__':
    verify_phase12_crm()
