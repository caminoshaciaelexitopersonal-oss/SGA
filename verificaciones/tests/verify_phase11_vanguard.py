import asyncio
import os
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        index_path = f"file://{os.path.abspath('SGA-CD-WEB.git/index.html')}"
        print(f"Loading page at {index_path}...")
        await page.goto(index_path, wait_until="domcontentloaded")

        # Wait for dynamic island and brand logo
        await page.wait_for_selector('#dynamic-island-container')
        await page.wait_for_selector('.sga-brand-logo')

        # Trigger dynamic island notification to expand it for screenshot
        await page.evaluate("""() => {
            if (window.SGADynamicIsland) {
                window.SGADynamicIsland.notify({
                    message: 'Fase 11 Vanguard: Isla Dinámica Activa & Ciberseguridad OK',
                    type: 'info',
                    duration: 10000
                });
            }
        }""")
        await page.wait_for_timeout(500)

        # Scroll slightly to trigger parallax and Bento Grid view
        await page.evaluate("window.scrollTo(0, 800)")
        await page.wait_for_timeout(500)

        output_vanguard = "/home/jules/verification/vanguard_frontend_powerbi.png"
        os.makedirs(os.path.dirname(output_vanguard), exist_ok=True)
        await page.screenshot(path=output_vanguard, full_page=False)
        print(f"Vanguard Power BI screenshot saved to {output_vanguard}")

        # Verify favicon loading
        favicon_path = f"file://{os.path.abspath('SGA-CD-WEB.git/favicon.svg')}"
        await page.goto(favicon_path)
        output_favicon = "/home/jules/verification/branding_favicon_check.png"
        await page.screenshot(path=output_favicon)
        print(f"Branding favicon screenshot saved to {output_favicon}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
