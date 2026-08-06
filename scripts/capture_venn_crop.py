from playwright.sync_api import sync_playwright

URL = 'https://mydopa.app'
SCREENSHOTS_DIR = '/Users/reneestripeaut/DOPAmine/screenshots/'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(URL, wait_until='networkidle')

    # The LEARNING text was found at y=2272 in 1920px-wide full page.
    # The Venn section encompasses that text and the COACHING circle.
    # Find both circles' container section more broadly.

    # Try to get the section containing both LEARNING and COACHING
    # Use a broader parent element search
    try:
        # Find the element containing both circles — look for the section parent
        el = page.locator('text=LEARNING').first
        # Walk up to find a section or div that contains both circles
        # Use evaluate to get parent bounding box
        box_info = page.evaluate("""() => {
            // Find all elements containing 'LEARNING'
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                if (node.textContent.includes('LEARNING')) {
                    // Walk up to find a section-like container
                    let el = node.parentElement;
                    for (let i = 0; i < 10; i++) {
                        if (!el) break;
                        const rect = el.getBoundingClientRect();
                        const tag = el.tagName.toLowerCase();
                        const cls = el.className || '';
                        // Look for a container that's wide enough to hold both circles
                        if (rect.width > 300 && rect.height > 200) {
                            return {
                                tag, cls,
                                x: rect.left,
                                y: rect.top + window.scrollY,
                                width: rect.width,
                                height: rect.height,
                                scrollY: window.scrollY
                            };
                        }
                        el = el.parentElement;
                    }
                }
            }
            return null;
        }""")
        print("Box info from JS walk:", box_info)
    except Exception as e:
        print(f"JS walk failed: {e}")
        box_info = None

    # Also get the COACHING element bounding box
    try:
        coaching_el = page.locator('text=COACHING').first
        coaching_box = coaching_el.bounding_box()
        print("COACHING bounding box:", coaching_box)
    except Exception as e:
        print(f"COACHING lookup failed: {e}")
        coaching_box = None

    try:
        learning_el = page.locator('text=LEARNING').first
        learning_box = learning_el.bounding_box()
        print("LEARNING bounding box:", learning_box)
    except Exception as e:
        print(f"LEARNING lookup failed: {e}")
        learning_box = None

    # Also look for the "Your progress" text which appears below the venn diagram
    try:
        progress_el = page.locator('text=Your progress').first
        progress_box = progress_el.bounding_box()
        print("'Your progress' bounding box:", progress_box)
    except Exception as e:
        print(f"'Your progress' lookup failed: {e}")
        progress_box = None

    # Also look for "Strava for mental" which appears to the left of the venn
    try:
        strava_el = page.locator('text=Strava').first
        strava_box = strava_el.bounding_box()
        print("'Strava' bounding box:", strava_box)
    except Exception as e:
        print(f"'Strava' lookup failed: {e}")
        strava_box = None

    browser.close()
    print("Done.")
