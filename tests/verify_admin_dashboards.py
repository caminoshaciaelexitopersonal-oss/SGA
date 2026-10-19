import os
import time
from playwright.sync_api import sync_playwright

def verify_all_dashboards():
    os.makedirs('/home/jules/verification', exist_ok=True)

    jwt_admin_general = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbl9nZW5lcmFsIiwicm9sZXMiOlsidGFkbWluX2dlbmVyYWwiXSwiaW5xdWlsaW5vX2lkIjoxLCJleHAiOjI1MjQ2MDgwMDB9.signature"
    jwt_admin_empresa = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbl9lbXByZXNhIiwicm9sZXMiOlsidGFkbWluX2VtcHJlc2EiXSwiaW5xdWlsaW5vX2lkIjoxLCJleHAiOjI1MjQ2MDgwMDB9.signature"

    web_app = os.path.abspath('SGA-CD-WEB.git/app.html')

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        mock_script = """
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {
                const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                if (url.includes('/by-empresa') || url.includes('/areas')) {
                    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                try {
                    return await originalFetch.apply(this, args);
                } catch (e) {
                    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
            };
        """

        # 1. Admin General Panel & CRM Suite
        ctx1 = browser.new_context(viewport={"width": 1440, "height": 900})
        ctx1.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_admin_general}');
            localStorage.setItem('userRoles', JSON.stringify(['admin_general']));
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Super Admin General');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
            {mock_script}
        """)
        p1 = ctx1.new_page()
        p1.goto(f'file://{web_app}')
        p1.evaluate(f"""() => {{
            if (typeof renderAdminGeneralDashboardView === 'function') {{
                renderAdminGeneralDashboardView('{jwt_admin_general}');
            }}
        }}""")
        time.sleep(1.5)
        shot1 = '/home/jules/verification/panel_admin_general.png'
        p1.screenshot(path=shot1, full_page=True)
        print(f"[Screenshot Created] {shot1}")

        # 2. Admin Empresa / Power BI Dataviz Panel
        ctx2 = browser.new_context(viewport={"width": 1440, "height": 1100})
        ctx2.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_admin_empresa}');
            localStorage.setItem('userRoles', JSON.stringify(['admin_empresa']));
            localStorage.setItem('userId', '2');
            localStorage.setItem('userName', 'Admin Empresa');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
            {mock_script}
        """)
        p2 = ctx2.new_page()
        p2.goto(f'file://{web_app}')
        p2.evaluate(f"""() => {{
            if (typeof renderAdminEmpresaView === 'function') {{
                renderAdminEmpresaView('{jwt_admin_empresa}');
            }}
        }}""")
        time.sleep(1.5)
        shot2 = '/home/jules/verification/panel_admin_empresa_powerbi.png'
        p2.screenshot(path=shot2, full_page=True)
        print(f"[Screenshot Created] {shot2}")

        browser.close()

if __name__ == '__main__':
    verify_all_dashboards()
