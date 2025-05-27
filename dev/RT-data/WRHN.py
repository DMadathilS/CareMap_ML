from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 1) Point to your chromedriver; use a raw string to avoid invalid‐escape warnings
service = Service(r"P:\ML-Project\HospitalCare\chromedriver-win32\chromedriver.exe")

# 2) Headless Chrome setup
opts = Options()
opts.add_argument("--headless")
opts.add_argument("--disable-gpu")
driver = webdriver.Chrome(service=service, options=opts)

try:
    # 3) Load the outer page
    URL = "https://www.smgh.ca/patients-visitors/emergency-department-wait-times"
    driver.get(URL)

    wait = WebDriverWait(driver, 20)

    # 4) Wait for the iframe to appear, then switch into it
    iframe = wait.until(EC.presence_of_element_located((
        By.CSS_SELECTOR, "iframe[src*='smgh-predict.oculys.com']"
    )))
    driver.switch_to.frame(iframe)

    # 5) Now wait for the patient‐counts inside the iframe
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#currentPatients span")))

    # 6) Scrape Being Treated & Waiting
    spans = driver.find_elements(By.CSS_SELECTOR, "#currentPatients span")
    being_treated = spans[0].text
    waiting       = spans[1].text

    # 7) Scrape Estimated Wait & timestamp
    est_wait = driver.find_element(
        By.CSS_SELECTOR, "#mainStopwatch .stdStopwatchMiddleText"
    ).text
    timestamp = driver.find_element(
        By.CSS_SELECTOR, "#mainStopwatch .stdStopwatchBottomText"
    ).text

    # 8) Print results
    print("Being Treated:  ", being_treated)
    print("Waiting:        ", waiting)
    print("Est. Wait Time: ", est_wait)
    print("Last Updated:   ", timestamp)

finally:
    driver.quit()
