import http.server
import socketserver
import threading
import time
import os
import asyncio
from playwright.async_api import async_playwright

PORT = 8890
DIRECTORY = 'SGA-CD-WEB.git'
OUTPUT_DIR = '/home/jules/verification'

class ReuseServer(socketserver.TCPServer):
    allow_reuse_address = True

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    with ReuseServer(('127.0.0.1', PORT), Handler) as httpd:
        httpd.serve_forever()

os.makedirs(OUTPUT_DIR, exist_ok=True)

t = threading.Thread(target=start_server, daemon=True)
t.start()
time.sleep(1)

async def capture_evidence():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})

        await page.goto(f'http://127.0.0.1:{PORT}/index.html')
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(1000)

        # Dismiss error overlay if present due to offline API
        await page.evaluate('''() => {
            const overlay = document.getElementById('sga-error-modal-overlay');
            if (overlay) overlay.remove();
        }''')

        # Desktop Landing Screenshot (Hero Video & Modern Carousel)
        desktop_shot = os.path.join(OUTPUT_DIR, "landing_desktop_carousel_and_video.png")
        await page.screenshot(path=desktop_shot, full_page=False)
        print(f"[Playwright] Captured Desktop Landing Evidence: {desktop_shot}")

        # Slide 1 Verification
        slide1_state = await page.evaluate('''() => {
            const img = document.querySelector('.sga-carousel-slide[data-index="0"] img');
            return img ? { display: img.style.display, src: img.src, naturalWidth: img.naturalWidth } : null;
        }''')
        print("Slide 1 Image State:", slide1_state)

        # Navigate through slides to capture Slide 3
        await page.click("#sga-carousel-next")
        await page.wait_for_timeout(600)
        await page.click("#sga-carousel-next")
        await page.wait_for_timeout(600)

        slide3_shot = os.path.join(OUTPUT_DIR, "landing_carousel_slide_3_cultural.png")
        await page.screenshot(path=slide3_shot, full_page=False)
        print(f"[Playwright] Captured Slide 3 Cultural Evidence: {slide3_shot}")

        slide3_state = await page.evaluate('''() => {
            const img = document.querySelector('.sga-carousel-slide[data-index="2"] img');
            return img ? { display: img.style.display, src: img.src, naturalWidth: img.naturalWidth } : null;
        }''')
        print("Slide 3 Image State:", slide3_state)

        await page.close()

        # 2. Mobile View (375x812)
        mobile_page = await browser.new_page(viewport={"width": 375, "height": 812})
        await mobile_page.goto(f'http://127.0.0.1:{PORT}/index.html')
        await mobile_page.wait_for_load_state('networkidle')
        await mobile_page.wait_for_timeout(1000)

        await mobile_page.evaluate('''() => {
            const overlay = document.getElementById('sga-error-modal-overlay');
            if (overlay) overlay.remove();
        }''')

        mobile_shot = os.path.join(OUTPUT_DIR, "landing_mobile_carousel.png")
        await mobile_page.screenshot(path=mobile_shot, full_page=False)
        print(f"[Playwright] Captured Mobile Landing Evidence: {mobile_shot}")
        await mobile_page.close()

        # 3. Admin General Landing Editor View
        admin_page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await admin_page.goto(f'http://127.0.0.1:{PORT}/app.html')
        await admin_page.wait_for_timeout(1000)

        await admin_page.evaluate('''() => {
            const overlay = document.getElementById('sga-error-modal-overlay');
            if (overlay) overlay.remove();

            localStorage.setItem('sga_token', 'mock_token');
            localStorage.setItem('sga_user', JSON.stringify({ rol: 'admin_general', nombre: 'Administrador General' }));
            if (window.sgaViewRegistry && window.sgaViewRegistry['admin_general'] && window.sgaViewRegistry['admin_general']['gestor-landing']) {
                const main = document.getElementById('app-main-content');
                if (main) window.sgaViewRegistry['admin_general']['gestor-landing'](main);
            }
        }''')
        await admin_page.wait_for_timeout(1000)

        admin_shot = os.path.join(OUTPUT_DIR, "admin_general_landing_editor.png")
        await admin_page.screenshot(path=admin_shot, full_page=False)
        print(f"[Playwright] Captured Admin General Editor Evidence: {admin_shot}")

        await browser.close()

asyncio.run(capture_evidence())
