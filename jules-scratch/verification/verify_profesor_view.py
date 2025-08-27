import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to the login page
        login_path = os.path.abspath('SGA-CD-WEB.git/login.html')
        page.goto(f'file://{login_path}')

        # 2. Log in as the professor
        page.get_by_placeholder('Nombre de Usuario').fill('profesor_test')
        page.get_by_placeholder('Contraseña').fill('password')
        page.get_by_role('button', name='Ingresar').click()

        # 3. Wait for navigation and click the 'Gestionar Cursos' link
        expect(page).to_have_url('app.html', timeout=10000)
        page.get_by_role('link', name='Gestionar Cursos').click()

        # 4. Verify that the courses table has loaded
        content_area = page.locator('#content-area')
        expect(content_area.get_by_role('heading', name='Mis Cursos')).to_be_visible()

        # Check for the table header for courses
        expect(content_area.get_by_role('cell', name='Nombre del Curso')).to_be_visible()

        # 5. Click the 'Ver Alumnos' button for the first course
        # Note: This assumes the test database has at least one course for this professor.
        # If not, this part of the test will fail, which is acceptable.
        ver_alumnos_button = page.get_by_role('button', name='Ver Alumnos').first
        expect(ver_alumnos_button).to_be_visible()
        ver_alumnos_button.click()

        # 6. Verify that the students table has loaded
        alumnos_container = page.locator('#profesor-alumnos-container')
        expect(alumnos_container.get_by_role('heading', name='Alumnos en')).to_be_visible()

        # Check for the table header for students
        expect(alumnos_container.get_by_role('cell', name='Nombre Completo')).to_be_visible()

        print("Profesor dashboard view with student list loaded successfully.")

        # 7. Take a screenshot
        page.screenshot(path='jules-scratch/verification/profesor_dashboard.png')
        print("Screenshot of professor dashboard saved.")

        browser.close()

if __name__ == '__main__':
    run_verification()
