def get_kwc_walkin_clinics():
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    import time

    opts = Options()
    opts.add_argument("--disable-gpu")
    opts.add_argument("--ignore-certificate-errors")
    opts.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113 Safari/537.36")
    # opts.add_argument("--headless")  # Optional: enable for silent scraping

    try:
        driver = webdriver.Chrome(service=Service("chromedriver.exe"), options=opts)
    except Exception as e:
        return [f"Chrome failed to start: {str(e)}"]

    try:
        driver.get("https://211ontario.ca/")
        wait = WebDriverWait(driver, 15)

        # Step 1: Search for "walk-in clinic Kitchener"
        search_box = wait.until(EC.presence_of_element_located((By.ID, "search-what")))
        search_box.clear()
        search_box.send_keys("walk-in clinic Kitchener")

        search_button = driver.find_element(By.ID, "search-submit")
        search_button.click()

        time.sleep(5)  # Let results load

        results = driver.find_elements(By.CSS_SELECTOR, ".search-result-item")
        clinics = []

        for r in results[:5]:  # Top 5 listings
            try:
                title = r.find_element(By.CSS_SELECTOR, ".search-result-title a").text.strip()
                address = r.find_element(By.CSS_SELECTOR, ".search-result-address").text.strip()
                clinics.append(f"{title} — {address}")
            except Exception:
                continue

        return clinics if clinics else ["No walk-in clinics found."]
    except Exception as e:
        return [f"Error during scraping: {str(e)}"]
    finally:
        driver.quit()
