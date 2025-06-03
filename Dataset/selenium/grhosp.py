# scrape_grhosp_selenium.py

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 1) URL of the GRH Emergency Wait page
URL = "https://www.grhosp.on.ca/care/services-departments/emergency/current-emergency-wait"

# 2) ChromeDriver location (if not on PATH)
service = Service("P:\ML-Project\HospitalCare\chromedriver-win32\chromedriver.exe")
driver = webdriver.Chrome(service=service)

# 3) Headless Chrome options
opts = Options()
# opts.add_argument("--headless")
opts.add_argument("--disable-gpu")
driver = webdriver.Chrome(options=opts)  # or webdriver.Chrome(service=service, options=opts)

try:
    driver.get(URL)

    wait = WebDriverWait(driver, 20)
    # wait until the wait-time div is visible and populated
    arrival_elem = wait.until(EC.visibility_of_element_located((By.ID, "arrival-to-md")))
    patients_elem = wait.until(EC.visibility_of_element_located((By.ID, "patients-waiting")))

    wait_time     = arrival_elem.text.strip()
    patients_wait = patients_elem.text.strip()

    print("Current ED Wait Time:", wait_time)
    print("Patients Waiting:",   patients_wait)

finally:
    driver.quit()
