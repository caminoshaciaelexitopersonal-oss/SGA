import os
import time
from playwright.sync_api import sync_playwright

def verify_phase12_2():
    os.makedirs('/home/jules/verification', exist_ok=True)

    jwt_admin_general = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbImFkbWluX2dlbmVyYWwiXSwiaW5xdWlsaW5vX2lkIjoxLCJleHAiOjI1MjQ2MDgwMDB9.signature"
    jwt_admin_empresa = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbXPreXNhIiwicm9sZXMiOlsiYWRtaW5fZW1wcmVzYSJdLCJpbnF1aWxpbm9faWQiOjEsImV4cCI6MjUyNDYwODAwMH0.signature"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # --- 1. Screenshot for Cleaned Admin General Dashboard ---
        context1 = browser.new_context(viewport={"width": 1440, "height": 1100})
        context1.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_admin_general}');
            localStorage.setItem('userRoles', JSON.stringify(['admin_general']));
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Super Admin');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
        """)
        page1 = context1.new_page()
        web_app = os.path.abspath('SGA-CD-WEB.git/app.html')
        page1.goto(f'file://{web_app}')

        page1.evaluate(f"""() => {{
            if (typeof renderAdminGeneralDashboardView === 'function') {{
                renderAdminGeneralDashboardView('{jwt_admin_general}');
            }}
        }}""")
        time.sleep(2)
        shot1_path = '/home/jules/verification/crm_cleaned_admin_general.png'
        page1.screenshot(path=shot1_path, full_page=True)
        print(f"[Screenshot Created] {shot1_path}")

        # --- 2. Screenshot for Embedded Admin Empresa Dashboard ---
        context2 = browser.new_context(viewport={"width": 1440, "height": 1400})
        context2.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_admin_empresa}');
            localStorage.setItem('userRoles', JSON.stringify(['admin_empresa']));
            localStorage.setItem('userId', '2');
            localStorage.setItem('userName', 'Admin Empresa');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');

            // Mock fetch to prevent STD-ERR-503 error popup on offline backend calls
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {{
                const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                if (url.includes('/api/v1/admin/users/by-empresa')) {{
                    return new Response(JSON.stringify([
                        {{ id: 101, nombre_completo: 'Carlos Mendoza', correo: 'carlos.mendoza@sga-cd.org', roles: ['profesor'] }},
                        {{ id: 102, nombre_completo: 'Elena Ramos', correo: 'elena.ramos@sga-cd.org', roles: ['profesional_area'] }}
                    ]), {{ status: 200, headers: {{ 'Content-Type': 'application/json' }} }});
                }}
                if (url.includes('/api/v1/admin/areas')) {{
                    return new Response(JSON.stringify([
                        {{ id: 1, nombre: 'Área de Deportes (Disciplinas)', descripcion: 'Taekwondo, Fútbol, Baloncesto, Natación' }},
                        {{ id: 2, nombre: 'Área de Cultura (Talleres)', descripcion: 'Danza (Joropo, Salsa, Vallenato) e Instrumentos' }}
                    ]), {{ status: 200, headers: {{ 'Content-Type': 'application/json' }} }});
                }}
                try {{
                    return await originalFetch.apply(this, args);
                }} catch (e) {{
                    return new Response(JSON.stringify([]), {{ status: 200, headers: {{ 'Content-Type': 'application/json' }} }});
                }}
            }};
        """)
        page2 = context2.new_page()
        page2.goto(f'file://{web_app}')

        page2.evaluate(f"""() => {{
            if (typeof renderAdminEmpresaView === 'function') {{
                renderAdminEmpresaView('{jwt_admin_empresa}');
            }}
        }}""")
        time.sleep(2)
        shot2_path = '/home/jules/verification/crm_embedded_admin_empresa.png'
        page2.screenshot(path=shot2_path, full_page=True)
        print(f"[Screenshot Created] {shot2_path}")

        browser.close()

if __name__ == '__main__':
    verify_phase12_2()
