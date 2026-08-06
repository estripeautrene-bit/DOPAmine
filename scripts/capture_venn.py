from playwright.sync_api import sync_playwright

URL = 'https://mydopa.app'
SCREENSHOTS_DIR = '/Users/reneestripeaut/DOPAmine/screenshots/'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(URL, wait_until='networkidle')

    # Full-page screenshot
    page.screenshot(path=SCREENSHOTS_DIR + 'mydopa_fullpage_desktop.png', full_page=True)
    print("Full-page screenshot saved.")

    # Find the Venn diagram section by looking for text containing LEARNING or COACHING
    # Try multiple selectors to locate the venn section
    venn_element = None

    # Try to find by text content
    selectors_to_try = [
        'text=LEARNING',
        'text=COACHING',
        '[class*="venn"]',
        '[class*="circle"]',
        '[id*="venn"]',
        '[id*="circle"]',
        'section:has-text("LEARNING")',
        'section:has-text("COACHING")',
        'div:has-text("LEARNING"):has-text("COACHING")',
    ]

    found_selector = None
    for sel in selectors_to_try:
        try:
            el = page.locator(sel).first
            if el.count() > 0:
                box = el.bounding_box()
                if box:
                    print(f"Found element with selector: {sel}")
                    print(f"  Bounding box: {box}")
                    found_selector = sel
                    venn_element = el
                    break
        except Exception as e:
            print(f"Selector '{sel}' failed: {e}")
            continue

    if venn_element:
        box = venn_element.bounding_box()
        print(f"Using bounding box: {box}")

        # Expand crop area with padding to capture full Venn section
        pad = 80
        x = max(0, box['x'] - pad)
        y = max(0, box['y'] - pad)
        width = min(1920, box['width'] + pad * 2)
        height = min(5000, box['height'] + pad * 2)

        page.screenshot(
            path=SCREENSHOTS_DIR + 'mydopa_venn_section.png',
            clip={'x': x, 'y': y, 'width': width, 'height': height},
            full_page=True
        )
        print(f"Venn section screenshot saved (clip: x={x}, y={y}, w={width}, h={height}).")
    else:
        # Fallback: scroll through page to find venn section manually
        # Get full page height
        full_height = page.evaluate("() => document.body.scrollHeight")
        page_width = 1920
        print(f"Full page height: {full_height}. Saving full page screenshot as fallback.")
        # Save a second full-page screenshot as the venn section (user can crop manually)
        page.screenshot(path=SCREENSHOTS_DIR + 'mydopa_venn_section.png', full_page=True)

    # Also dump all text to help find section
    try:
        body_text = page.inner_text('body')
        print("--- Page text snippet (first 2000 chars) ---")
        print(body_text[:2000])
    except Exception as e:
        print(f"Could not get body text: {e}")

    browser.close()
    print("Done.")
