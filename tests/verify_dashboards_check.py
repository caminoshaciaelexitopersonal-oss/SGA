import os
import time
from playwright.sync_api import sync_playwright

def verify_dashboards():
    os.makedirs('/home/jules/verification', exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        page.on("console", lambda msg: print(f"[BROWSER CONSOLE {msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: print(f"[BROWSER UNCAUGHT EXCEPTION] {err}"))

        # Serve files via local server or page goto
        web_path = os.path.abspath("SGA-CD-WEB.git/app.html")
        page.goto(f"file://{web_path}")
        page.wait_for_timeout(1000)

        # Inject views scripts directly if file:// protocol restricted cross-script execution
        page.add_script_tag(path="SGA-CD-WEB.git/js/views/admin_general.js")
        page.add_script_tag(path="SGA-CD-WEB.git/js/views/admin_empresa.js")

        page.evaluate("""() => {
            localStorage.setItem('sga_token', 'mock_jwt_token');
            localStorage.setItem('sga_user', JSON.stringify({
                id: 1,
                nombre_completo: 'Super Admin General',
                correo: 'admin@sga-cd.org',
                rol: 'admin_general'
            }));
        }""")

        # Render Admin General Dashboard
        print("Rendering admin_general dashboard...")
        page.evaluate("async () => await renderAdminGeneralDashboardView('mock_jwt')")
        page.wait_for_timeout(1000)
        page.screenshot(path='/home/jules/verification/dashboard_admin_general_charts.png')

        # Render Admin Empresa / Power BI Dashboard
        print("Rendering admin_empresa Power BI dashboard...")
        page.evaluate("async () => await renderAdminEmpresaView('mock_jwt')")
        page.wait_for_timeout(1000)
        page.screenshot(path='/home/jules/verification/dashboard_admin_empresa_charts.png')

        browser.close()
        print("Verification complete.")

if __name__ == '__main__':
    verify_dashboards()
