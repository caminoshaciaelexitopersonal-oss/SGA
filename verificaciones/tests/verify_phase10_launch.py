import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    os.makedirs('/home/jules/verification', exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1440, 'height': 900})

        # Load index.html
        file_path = f"file://{os.path.abspath('SGA-CD-WEB.git/index.html')}"
        await page.goto(file_path)
        await page.wait_for_timeout(1000)

        # Capture Hero & Presentation Video
        await page.screenshot(path='/home/jules/verification/landing_launch_video.png', full_page=False)
        print("Captured /home/jules/verification/landing_launch_video.png")

        # Scroll to Modern Carousel
        carousel = page.locator('#carrusel-moderno')
        if await carousel.count() > 0:
            await carousel.scroll_into_view_if_needed()
            await page.wait_for_timeout(1000)
            await page.screenshot(path='/home/jules/verification/landing_modern_carousel.png', full_page=False)
            print("Captured /home/jules/verification/landing_modern_carousel.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
