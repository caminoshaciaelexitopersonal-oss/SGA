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

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            # Desktop Viewport
            page = await browser.new_page(viewport={"width": 1440, "height": 900})
            await page.goto("http://localhost:8085/app.html")

            # Inject mock token and setup view
            await page.evaluate("""
                localStorage.setItem('sga_token', 'mock-token-test');
                localStorage.setItem('sga_user', JSON.stringify({ nombre: 'Director IMDER', roles: ['admin_empresa'] }));
            """)
            await page.reload()

            # Wait for content area to load admin_empresa view
            await page.wait_for_timeout(2000)

            # Capture Desktop Dashboard Screenshot
            screenshot_path_desktop = "/home/jules/verification/phase8_13_5_empresa_specialization_desktop.png"
            await page.screenshot(path=screenshot_path_desktop, full_page=True)
            print(f"Captured desktop screenshot: {screenshot_path_desktop}")

            # Test Vocation Switcher
            vocation_cultural_btn = page.locator("button:has-text('Vocación Cultural')")
            if await vocation_cultural_btn.count() > 0:
                await vocation_cultural_btn.click()
                await page.wait_for_timeout(1000)

                screenshot_path_cultural = "/home/jules/verification/phase8_13_5_empresa_cultural_desktop.png"
                await page.screenshot(path=screenshot_path_cultural, full_page=True)
                print(f"Captured cultural vocation screenshot: {screenshot_path_cultural}")

            # Mobile Viewport
            context_mobile = await browser.new_context(viewport={"width": 390, "height": 844})
            page_mobile = await context_mobile.new_page()
            await page_mobile.goto("http://localhost:8085/app.html")
            await page_mobile.wait_for_timeout(1500)

            screenshot_path_mobile = "/home/jules/verification/phase8_13_5_empresa_specialization_mobile.png"
            await page_mobile.screenshot(path=screenshot_path_mobile, full_page=True)
            print(f"Captured mobile screenshot: {screenshot_path_mobile}")

            await browser.close()
    finally:
        web_process.terminate()

if __name__ == "__main__":
    asyncio.run(main())
