import os
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Navigate to the login page
        login_path = os.path.abspath('SGA-CD-WEB.git/login.html')
        page.goto(f'file://{login_path}')

        # 2. Log in as the area manager
        page.get_by_placeholder('Nombre de Usuario').fill('jefe_area_test')
        page.get_by_placeholder('Contraseña').fill('password')
        page.get_by_role('button', name='Ingresar').click()

        # 3. Wait for navigation and click the dashboard link
        expect(page).to_have_url('app.html', timeout=10000)
        page.get_by_role('link', name='Panel de Área').click()

        # 4. Verify that the dashboard content has loaded
        content_area = page.locator('#content-area')

        # Check for the headers of both tables
        expect(content_area.get_by_role('heading', name='Personal del Área')).to_be_visible()
        expect(content_area.get_by_role('heading', name='Eventos del Área')).to_be_visible()

        # Check for table content headers
        expect(content_area.get_by_role('cell', name='Nombre Completo')).to_be_visible()
        expect(content_area.get_by_role('cell', name='Nombre del Evento')).to_be_visible()

        print("Jefe de Área dashboard view loaded successfully.")

        # 5. Take a screenshot
        page.screenshot(path='jules-scratch/verification/jefe_area_dashboard.png')
        print("Screenshot of Jefe de Área dashboard saved.")

        browser.close()

if __name__ == '__main__':
    run_verification()
