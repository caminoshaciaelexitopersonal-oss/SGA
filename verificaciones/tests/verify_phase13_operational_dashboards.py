import os
import time
from playwright.sync_api import sync_playwright

def verify_phase13_dashboards():
    os.makedirs('/home/jules/verification', exist_ok=True)

    jwt_profesional = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm9mZXNpb25hbCIsInJvbGVzIjpbInByb2Zlc2lvbmFsX2FyZWEiXSwiaW5xdWlsaW5vX2lkIjoxLCJleHAiOjI1MjQ2MDgwMDB9.signature"
    jwt_tecnico = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZWNuaWNvIiwicm9sZXMiOlsidGVjbmljb19hcmVhIl0sImlucXVpbGlub19pZCI6MSwiZXhwIjoyNTI0NjA4MDAwfQ.signature"
    jwt_profesor = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm9mZXNvciIsInJvbGVzIjpbInByb2Zlc29yIl0sImlucXVpbGlub19pZCI6MSwiZXhwIjoyNTI0NjA4MDAwfQ.signature"
    jwt_alumno = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbHVtbm8iLCJyb2xlcyI6WyJhbHVtbm8iXSwiaW5xdWlsaW5vX2lkIjoxLCJleHAiOjI1MjQ2MDgwMDB9.signature"

    web_app = os.path.abspath('SGA-CD-WEB.git/app.html')

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Common mock fetch script
        mock_script = """
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {
                const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                if (url.includes('/api/v1/profesor/courses')) {
                    return new Response(JSON.stringify([
                        { id: 1, nombre: 'Disciplina Deportiva: Taekwondo & Natación', descripcion: 'Entrenamiento técnico de alto rendimiento' },
                        { id: 2, nombre: 'Taller Cultural: Danza Joropo & Salsa', descripcion: 'Formación en ritmos tradicionales y folclor' },
                        { id: 3, nombre: 'Taller Cultural: Instrumentos Guitarra & Arpa', descripcion: 'Iniciación e interpretación instrumental' }
                    ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                if (url.includes('/api/v1/alumno/cursos')) {
                    return new Response(JSON.stringify([
                        { id: 101, nombre: 'Disciplina Deportiva: Fútbol Base', profesor: { nombre_completo: 'Carlos Mendoza' }, horario: 'Lunes y Miércoles 4:00 PM' },
                        { id: 102, nombre: 'Taller Cultural: Danza Joropo / Llanera', profesor: { nombre_completo: 'Elena Ramos' }, horario: 'Martes y Jueves 5:00 PM' },
                        { id: 103, nombre: 'Taller Cultural: Instrumentos Arpa & Guitarra', profesor: { nombre_completo: 'Roberto Gómez' }, horario: 'Sábados 9:00 AM' }
                    ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                if (url.includes('/api/v1/eventos')) {
                    return new Response(JSON.stringify([
                        { id: 1, nombre: 'Torneo Departamental de Taekwondo', tipo: 'Deportes', fecha: '2025-05-15', estado: 'En Curso' },
                        { id: 2, nombre: 'Festival de Danza Joropo y Salsa', tipo: 'Cultura', fecha: '2025-06-20', estado: 'Planificado' }
                    ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                if (url.includes('/api/v1/disciplinas')) {
                    return new Response(JSON.stringify([
                        { id: 1, nombre: 'Taekwondo y Fútbol (Disciplinas)', area: 'Área de Deportes' },
                        { id: 2, nombre: 'Danza Joropo / Llanera y Vallenato (Talleres)', area: 'Área de Cultura' },
                        { id: 3, nombre: 'Guitarra y Arpa (Instrumentos Culturales)', area: 'Área de Cultura' }
                    ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
                try {
                    return await originalFetch.apply(this, args);
                } catch (e) {
                    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
                }
            };
        """

        # --- 1. Screenshot Panel Profesional ---
        ctx1 = browser.new_context(viewport={"width": 1440, "height": 900})
        ctx1.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_profesional}');
            localStorage.setItem('userRoles', JSON.stringify(['profesional_area']));
            localStorage.setItem('userId', '10');
            localStorage.setItem('userName', 'Profesional de Área');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
            {mock_script}
        """)
        p1 = ctx1.new_page()
        p1.goto(f'file://{web_app}')
        p1.evaluate(f"""() => {{
            if (typeof renderProfesionalAreaDashboardView === 'function') {{
                renderProfesionalAreaDashboardView('{jwt_profesional}');
            }}
        }}""")
        time.sleep(1.5)
        shot1 = '/home/jules/verification/panel_profesional_cleaned.png'
        p1.screenshot(path=shot1, full_page=True)
        print(f"[Screenshot Created] {shot1}")

        # --- 2. Screenshot Panel Técnico ---
        ctx2 = browser.new_context(viewport={"width": 1440, "height": 900})
        ctx2.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_tecnico}');
            localStorage.setItem('userRoles', JSON.stringify(['tecnico_area']));
            localStorage.setItem('userId', '11');
            localStorage.setItem('userName', 'Técnico de Área');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
            {mock_script}
        """)
        p2 = ctx2.new_page()
        p2.goto(f'file://{web_app}')
        p2.evaluate(f"""() => {{
            if (typeof renderTecnicoAreaDashboardView === 'function') {{
                renderTecnicoAreaDashboardView('{jwt_tecnico}');
            }}
        }}""")
        time.sleep(1.5)
        shot2 = '/home/jules/verification/panel_tecnico_cleaned.png'
        p2.screenshot(path=shot2, full_page=True)
        print(f"[Screenshot Created] {shot2}")

        # --- 3. Screenshot Panel Profesor ---
        ctx3 = browser.new_context(viewport={"width": 1440, "height": 950})
        ctx3.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_profesor}');
            localStorage.setItem('userRoles', JSON.stringify(['profesor']));
            localStorage.setItem('userId', '12');
            localStorage.setItem('userName', 'Profesor Instructor');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
            {mock_script}
        """)
        p3 = ctx3.new_page()
        p3.goto(f'file://{web_app}')
        p3.evaluate(f"""() => {{
            if (typeof renderProfesorView === 'function') {{
                renderProfesorView('{jwt_profesor}');
            }}
        }}""")
        time.sleep(1.5)
        shot3 = '/home/jules/verification/panel_profesor_cleaned.png'
        p3.screenshot(path=shot3, full_page=True)
        print(f"[Screenshot Created] {shot3}")

        # --- 4. Screenshot Panel Alumno/Padre (Suscripción Estudiantil Costo 0) ---
        ctx4 = browser.new_context(viewport={"width": 1440, "height": 950})
        ctx4.add_init_script(f"""
            localStorage.setItem('accessToken', '{jwt_alumno}');
            localStorage.setItem('userRoles', JSON.stringify(['alumno']));
            localStorage.setItem('userId', '13');
            localStorage.setItem('userName', 'Alumno / Padre Acudiente');
            localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
            {mock_script}
        """)
        p4 = ctx4.new_page()
        p4.goto(f'file://{web_app}')
        p4.evaluate(f"""() => {{
            if (typeof renderMisCursosView === 'function') {{
                renderMisCursosView('{jwt_alumno}');
            }}
        }}""")
        time.sleep(1.5)
        shot4 = '/home/jules/verification/panel_alumno_gratuit_cleaned.png'
        p4.screenshot(path=shot4, full_page=True)
        print(f"[Screenshot Created] {shot4}")

        browser.close()

if __name__ == '__main__':
    verify_phase13_dashboards()
