import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to the login page
        login_path = os.path.abspath('SGA-CD-WEB.git/login.html')
        page.goto(f'file://{login_path}')

        # 2. Log in as the scenario manager
        page.get_by_placeholder('Nombre de Usuario').fill('jefe_escenarios_test')
        page.get_by_placeholder('Contraseña').fill('password')
        page.get_by_role('button', name='Ingresar').click()

        # 3. Wait for navigation and click the dashboard link
        expect(page).to_have_url('app.html', timeout=10000)
        page.get_by_role('link', name='Gestionar Escenarios').click()

        # 4. Verify that the dashboard content has loaded
        content_area = page.locator('#content-area')

        # Check for the heading and table headers
        expect(content_area.get_by_role('heading', name='Panel de Gestión de Escenarios')).to_be_visible()
        expect(content_area.get_by_role('cell', name='Nombre del Escenario')).to_be_visible(timeout=5000)
        expect(content_area.get_by_role('cell', name='Estado')).to_be_visible()

        print("Jefe de Escenarios dashboard view loaded successfully.")

        # 5. Take a screenshot
        page.screenshot(path='jules-scratch/verification/jefe_escenarios_dashboard.png')
        print("Screenshot of Jefe de Escenarios dashboard saved.")

        browser.close()

if __name__ == '__main__':
    run_verification()
