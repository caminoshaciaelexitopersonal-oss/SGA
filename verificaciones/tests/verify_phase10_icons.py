import asyncio
import os
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()

        # Serve static SGA-CD-WEB files or open index.html directly
        index_path = f"file://{os.path.abspath('SGA-CD-WEB.git/index.html')}"
        print(f"Loading page at {index_path}...")
        await page.goto(index_path, wait_until="domcontentloaded")

        # Wait for SVG icons to render in DOM
        await page.wait_for_selector('.ui-icon-svg')
        await page.wait_for_selector('.floating-social-bar')

        # Hover on first social brand link to trigger active state transition
        whatsapp_btn = page.locator('.social-brand-link[data-platform="whatsapp"]')
        await whatsapp_btn.hover()
        await page.wait_for_timeout(300)

        # Hover on bookmark action button in live monitor card
        bookmark_btn = page.locator('.bookmark-btn').first
        if await bookmark_btn.count() > 0:
            await bookmark_btn.hover()
            await page.wait_for_timeout(300)

        output_path = "/home/jules/verification/ui_icons_metallic_style.png"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        await page.screenshot(path=output_path, full_page=False)
        print(f"Screenshot successfully saved to {output_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
