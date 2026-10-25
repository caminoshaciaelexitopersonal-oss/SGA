import asyncio
import os
import subprocess
import time
from playwright.async_api import async_playwright

async def main():
    os.makedirs("/home/jules/verification", exist_ok=True)

    # Start python http.server for SGA-CD-WEB
    web_process = subprocess.Popen(
        ["python3", "-m", "http.server", "8085", "--directory", "SGA-CD-WEB.git"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(1.5)

    valid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDEiLCJleHAiOjIwMDAwMDAwMDAsInJvbGVzIjpbImFkbWluX2VtcHJlc2EiXSwiaW5xdWlsaW5vX2lkIjoxfQ.fakesignature"

    current_vocacion = "deportiva"

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            # --- CAPTURA 4: Login corregido con inputs apilados verticalmente ---
            page_login = await browser.new_page(viewport={"width": 1280, "height": 850})
            await page_login.goto("http://localhost:8085/login.html")
            await page_login.wait_for_timeout(1000)

            cap4_path = "/home/jules/verification/captura_4_login_corrected.png"
            await page_login.screenshot(path=cap4_path, full_page=True)
            print(f"Captured Captura 4 (Corrected Login): {cap4_path}")

            # --- PANEL AUTENTICADO ADMIN_EMPRESA ---
            context = await browser.new_context(viewport={"width": 1440, "height": 1080})
            page = await context.new_page()

            # Mock API routes to avoid error overlay
            async def handle_capabilities(route):
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=f"""{{
                        "inquilino_id": 1,
                        "nombre_empresa": "Instituto Municipal de Deporte y Recreación — IMDER",
                        "tipo_organizacion": "entidad_publica",
                        "ambito_organizacional": "municipal",
                        "vocacion_institucional": "{current_vocacion}",
                        "canonical_plan": "full",
                        "subscription_status": "activa",
                        "is_active": true,
                        "panel_institucional_enabled": true,
                        "gestion_usuarios_enabled": true,
                        "modulos_deportivos_culturales_enabled": true,
                        "crm_leads_enabled": true,
                        "crm_campaigns_enabled": true,
                        "ai_images_enabled": true,
                        "ai_carousels_enabled": true,
                        "ai_video_enabled": true,
                        "ai_reels_enabled": true,
                        "social_publishing_enabled": true,
                        "crm_analytics_enabled": true,
                        "monthly_limits": {{ "images": 100, "carousels": 50, "videos": 20, "reels": 20, "llm_prompts": 1000, "social_posts": 100 }}
                    }}"""
                )

            async def handle_my_specialties(route):
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body="""[
                        { "especialidad_id": 1, "nombre": "Taekwondo (WT/ITF)", "vertical": "deporte", "categoria": "Artes Marciales", "es_estandar": true },
                        { "especialidad_id": 2, "nombre": "Fútbol Campo & Futsal", "vertical": "deporte", "categoria": "Deportes de Pelota", "es_estandar": true },
                        { "especialidad_id": 3, "nombre": "Musculación & Fitness Funcional", "vertical": "deporte", "categoria": "Acondicionamiento Físico", "es_estandar": true },
                        { "especialidad_id": 101, "nombre": "Danza Joropo / Llanera", "vertical": "cultura", "categoria": "Danza y Ballet", "es_estandar": true },
                        { "especialidad_id": 102, "nombre": "Guitarra Clásica & Acústica", "vertical": "cultura", "categoria": "Música e Instrumentos", "es_estandar": true }
                    ]"""
                )

            async def handle_search_specialties(route):
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body="""[
                        { "id": 50, "nombre": "Padel - Competición", "vertical": "deporte", "categoria": "Deportes de Raqueta", "es_estandar": true }
                    ]"""
                )

            async def handle_patch_vocacion(route):
                nonlocal current_vocacion
                req = route.request
                post_data = req.post_data_json if req.post_data_json else {}
                if "vocacion_institucional" in post_data:
                    current_vocacion = post_data["vocacion_institucional"]
                await route.fulfill(status=200, content_type="application/json", body="{\"status\": \"ok\"}")

            await page.route("**/api/v1/tenants/my-plan-capabilities", handle_capabilities)
            await page.route("**/api/v1/catalogo/my-specialties", handle_my_specialties)
            await page.route("**/api/v1/catalogo/especialidades*", handle_search_specialties)
            await page.route("**/api/v1/catalogo/vocacion", handle_patch_vocacion)

            # Pre-set localStorage before navigation
            await page.add_init_script(f"""
                localStorage.setItem('accessToken', '{valid_token}');
                localStorage.setItem('userId', '101');
                localStorage.setItem('userName', 'Director IMDER Villavicencio');
                localStorage.setItem('userRoles', JSON.stringify(['admin_empresa']));
            """)

            await page.goto("http://localhost:8085/app.html")
            await page.wait_for_timeout(1000)

            # Explicitly trigger admin_empresa panel render
            await page.evaluate(f"""
                if (typeof renderContentForView === 'function') {{
                    renderContentForView('panel-empresa', '{valid_token}', 'admin_empresa');
                }}
            """)
            await page.wait_for_timeout(1000)

            # Dismiss any error modal if present
            await page.evaluate("""
                const overlay = document.getElementById('sga-error-modal-overlay');
                if (overlay) overlay.style.display = 'none';
            """)

            # --- CAPTURA 1: Vocación Deportiva ---
            btn_deportiva = page.locator("button:has-text('Vocación Deportiva')")
            if await btn_deportiva.count() > 0:
                await btn_deportiva.click(force=True)
                await page.wait_for_timeout(800)

            cap1_path = "/home/jules/verification/captura_1_deportiva_panel.png"
            await page.screenshot(path=cap1_path, full_page=True)
            print(f"Captured Captura 1 (Vocación Deportiva): {cap1_path}")

            # --- CAPTURA 3: Buscador On-The-Fly [+ Crear y Registrar] ---
            search_input = page.locator("#catalog-search-input")
            if await search_input.count() > 0:
                await search_input.fill("Padel Professional")
                await page.wait_for_timeout(600)

                # Take element screenshot of search section
                card_search = page.locator("#catalog-search-results-dropdown").locator("..")
                cap3_path = "/home/jules/verification/captura_3_on_the_fly_creation.png"
                await card_search.screenshot(path=cap3_path)
                print(f"Captured Captura 3 (On-The-Fly Creation): {cap3_path}")

            # --- CAPTURA 2: Vocación Cultural ---
            btn_cultural = page.locator("button:has-text('Vocación Cultural')")
            if await btn_cultural.count() > 0:
                await btn_cultural.click(force=True)
                await page.wait_for_timeout(1000)

            cap2_path = "/home/jules/verification/captura_2_cultural_panel.png"
            await page.screenshot(path=cap2_path, full_page=True)
            print(f"Captured Captura 2 (Vocación Cultural): {cap2_path}")

            await browser.close()
    finally:
        web_process.terminate()

if __name__ == "__main__":
    asyncio.run(main())
