from playwright.sync_api import sync_playwright

def capture(url, output_path, viewport_width=1920, viewport_height=1080):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': viewport_width, 'height': viewport_height})
        page.goto(url, wait_until='networkidle')
        page.screenshot(path=output_path, full_page=False)
        browser.close()

if __name__ == '__main__':
    capture('https://mydopa.app', '/Users/reneestripeaut/DOPAmine/screenshots/fullpage_desktop.png')
    print("Done")
