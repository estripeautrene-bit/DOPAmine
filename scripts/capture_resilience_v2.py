from playwright.sync_api import sync_playwright

def capture_resilience_section():
    output_path = '/Users/reneestripeaut/DOPAmine/screenshots/resilience-v2.png'

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        page.goto('https://mydopa.app', wait_until='networkidle')

        # Try to find the Resilience Horizon section by its heading text
        resilience_section = None

        # Search for the section containing the key text
        candidates = [
            'text="One off day doesn\'t erase what you\'re building."',
            'text="Resilience Horizon"',
            'text="One off day"',
        ]

        for selector in candidates:
            try:
                el = page.locator(selector).first
                if el.count() > 0:
                    print(f"Found element with selector: {selector}")
                    resilience_section = el
                    break
            except Exception as e:
                print(f"Selector {selector} failed: {e}")

        if resilience_section:
            # Scroll the element into view
            resilience_section.scroll_into_view_if_needed()
            page.wait_for_timeout(800)

            # Get bounding box of the element and find its parent section
            bbox = resilience_section.bounding_box()
            print(f"Element bbox: {bbox}")

            # Walk up to find a section/div container that spans the full two-column layout
            # Try to get the parent section element
            parent = page.evaluate("""(el) => {
                let node = el;
                for (let i = 0; i < 6; i++) {
                    node = node.parentElement;
                    if (!node) break;
                    const tag = node.tagName.toLowerCase();
                    const rect = node.getBoundingClientRect();
                    if ((tag === 'section' || tag === 'div') && rect.width > 800 && rect.height > 300) {
                        return {
                            top: rect.top + window.scrollY,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                            scrollY: window.scrollY,
                            tag: tag
                        };
                    }
                }
                return null;
            }""", resilience_section.element_handle())

            print(f"Parent section info: {parent}")

            if parent and parent['height'] > 300:
                # Scroll so this section is centered in viewport
                scroll_target = max(0, parent['top'] - 100)
                page.evaluate(f"window.scrollTo(0, {scroll_target})")
                page.wait_for_timeout(600)

                # Take a viewport screenshot (1920x1080, above-the-fold of the scrolled position)
                page.screenshot(path=output_path, full_page=False)
                print(f"Screenshot saved to {output_path}")
            else:
                # Fallback: just scroll element into view and screenshot
                page.screenshot(path=output_path, full_page=False)
                print(f"Fallback screenshot saved to {output_path}")
        else:
            # Last resort: take a full-page screenshot and note section not found
            print("WARNING: Resilience Horizon section not found. Capturing full page.")
            page.screenshot(path=output_path, full_page=True)
            print(f"Full-page screenshot saved to {output_path}")

        browser.close()

if __name__ == '__main__':
    capture_resilience_section()
