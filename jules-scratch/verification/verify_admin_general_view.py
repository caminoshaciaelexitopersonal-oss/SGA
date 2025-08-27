import os
import re
import json
from playwright.sync_api import sync_playwright, expect

# Mock data
MOCK_ROLES = [
    {"nombre": "admin_general", "descripcion": "Test Desc"},
    {"nombre": "admin_empresa", "descripcion": "Test Desc"},
    {"nombre": "jefe_area", "descripcion": "Test Desc"},
    {"nombre": "profesor", "descripcion": "Test Desc"},
]
# A fake JWT token for admin_general
FAKE_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0Iiwicm9sZXMiOlsiYWRtaW5fZ2VuZXJhbCJdLCJpbnF1aWxpbm9faWQiOjEsIm5vbWJyZV9jb21wbGV0byI6IkFkbWluIEdlbmVyYWwgVGVzdCJ9.fake_signature_admin_general"

def handle_route(route):
    """Function to intercept and mock API calls."""
    if "api/v1/auth/login" in route.request.url:
        route.fulfill(status=200, headers={"Content-Type": "application/json"}, body=json.dumps({"access_token": FAKE_ACCESS_TOKEN, "token_type": "bearer"}))
    elif "api/v1/roles" in route.request.url:
        route.fulfill(status=200, headers={"Content-Type": "application/json"}, body=json.dumps(MOCK_ROLES))
    else:
        route.continue_()

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.route(re.compile("api/v1/"), handle_route)

        page.goto('http://localhost:8080/login.html')

        page.get_by_placeholder('Nombre de Usuario').fill('admin_general')
        page.get_by_placeholder('Contraseña').fill('password')
        page.get_by_role('button', name='Ingresar').click()

        expect(page).to_have_url(re.compile("app.html"), timeout=10000)
        expect(page.locator('#user-info')).to_contain_text('Admin General Test')

        page.get_by_role('link', name='Verificar Roles BD').click()

        content_area = page.locator('#content-area')
        expect(content_area.get_by_role('heading', name='Verificación de Roles en Base de Datos')).to_be_visible()

        expect(content_area.get_by_role('row').filter(has_text="admin_empresa")).to_contain_text("Encontrado")
        expect(content_area.get_by_role('row').filter(has_text="alumno")).to_contain_text("Faltante")
        expect(content_area.get_by_role('row').filter(has_text="alumno").get_by_role('button', name='Crear Rol')).to_be_visible()

        print("SUCCESS: Admin General 'Verificar Roles' view loaded and verified successfully with mocked data.")

        page.screenshot(path='jules-scratch/verification/admin_general_view_mocked.png')
        print("Screenshot of mocked admin_general view saved.")

        browser.close()

if __name__ == '__main__':
    run_verification()
