from playwright.sync_api import sync_playwright

URL = 'https://mydopa.app'
SCREENSHOTS_DIR = '/Users/reneestripeaut/DOPAmine/screenshots/'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(URL, wait_until='networkidle')

    # SVG bounding box: x=810, y=2113, width=620, height=382
    # Strava text starts at x=535, y=2242
    # LEARNING/COACHING at y=2272
    # "Your progress" text at y=2495 (below the diagram)
    # We want to crop the full section: from left edge of strava text to right edge of coaching,
    # and from top of SVG to below "Your progress"

    # Section bounds (with padding):
    pad_h = 60   # horizontal padding
    pad_v = 80   # vertical padding

    # Full width of the content area: from ~400 (left edge) to ~1440 (right edge)
    x = max(0, 400)
    y = max(0, 2000)  # start above the section
    width = 1920 - 400  # 1520px wide to capture both left text and right circles
    height = 700        # enough to include "Your progress" line below

    page.screenshot(
        path=SCREENSHOTS_DIR + 'mydopa_venn_section.png',
        clip={'x': x, 'y': y, 'width': width, 'height': height},
        full_page=True
    )
    print(f"Venn section screenshot saved: x={x}, y={y}, w={width}, h={height}")

    browser.close()
    print("Done.")
