import asyncio
import os
import http.server
import socketserver
import threading
from playwright.async_api import async_playwright

PORT = 8878
DIRECTORY = "SGA-CD-WEB.git"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("", PORT), Handler)
    httpd.serve_forever()

async def main():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    await asyncio.sleep(1)

    os.makedirs("/home/jules/verification", exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})

        print("Navigating to SGA-CD Landing Page...")
        await page.goto(f"http://localhost:{PORT}/index.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Test SGAMarketingPublisher JS instance
        marketing_active = await page.evaluate("typeof window.SGAMarketingPublisher !== 'undefined'")
        print(f"[TEST] SGAMarketingPublisher loaded: {marketing_active}")
        assert marketing_active, "SGAMarketingPublisher failed to load"

        # Execute hook drafting simulation for Cultural Taller Danza Joropo
        hook_draft = await page.evaluate("""
            window.SGAMarketingPublisher.captureAndDraftHook({
                type: 'instagram',
                title: 'Taller de Danza Joropo / Llanera',
                disciplineOrTaller: 'Danza Tradicional Llanera',
                category: 'Modalidades Culturales',
                targetRegion: 'Meta'
            })
        """)
        print(f"[TEST] Hook draft generated: {hook_draft['draft']['title']}")
        assert "Danza Tradicional" in hook_draft['draft']['igCaption'], "Instagram caption hook mismatch"

        # Simulate WhatsApp alert dispatch
        wa_dispatch = await page.evaluate("""
            window.SGAMarketingPublisher.dispatchWhatsAppAlert('attendance_sync', {
                alumno: 'Carlos Rodríguez',
                actividad: 'Entrenamiento de Taekwondo',
                estado: 'Sincronizado'
            })
        """)
        print(f"[TEST] WhatsApp alert simulated dispatch completed")

        # Capture visual state
        screenshot_path = "/home/jules/verification/marketing_sync.png"
        await page.screenshot(path=screenshot_path)
        print(f"Captured verification screenshot at {screenshot_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
