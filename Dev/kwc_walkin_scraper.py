def get_kwc_walkin_clinics():
    from selenium import webdriver
    from selenium.webdriver.firefox.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    import time

    opts = Options()
    opts.add_argument("--headless")

    try:
        driver = webdriver.Firefox(executable_path="geckodriver.exe", options=opts)
    except Exception as e:
        return [f"❌ Firefox failed to start: {str(e)}"]

    try:
        driver.get("https://211ontario.ca/")
        time.sleep(3)
        wait = WebDriverWait(driver, 10)

        # Try to click English
        try:
            english_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(text(),'ENGLISH')]/..")))
            driver.execute_script("arguments[0].click();", english_button)
            time.sleep(2)
        except:
            pass  # already on homepage or skipped

        # Search
        search_box = wait.until(EC.presence_of_element_located((By.ID, "search-what")))
        search_box.clear()
        search_box.send_keys("walk-in clinic Kitchener")
        driver.find_element(By.ID, "search-submit").click()
        time.sleep(5)

        results = []
        for r in driver.find_elements(By.CSS_SELECTOR, ".search-result-item")[:5]:
            try:
                name = r.find_element(By.CSS_SELECTOR, ".search-result-title a").text.strip()
                addr = r.find_element(By.CSS_SELECTOR, ".search-result-address").text.strip()
                results.append(f"{name} — {addr}")
            except:
                continue

        return results if results else ["No walk-in clinics found."]
    except Exception as e:
        return [f"🏥 Firefox error: {str(e)}"]
    finally:
        try:
            driver.quit()
        except:
            pass
