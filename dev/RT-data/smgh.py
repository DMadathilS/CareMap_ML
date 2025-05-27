from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 1) Your Power BI report URL
REPORT_URL = (
    "https://app.powerbi.com/view?"
    "r=eyJrIjoiMDY3NjFiOTItZGQyYy00ZDU5LWFmMzQtYzkyNWU5ZGZjN2ZhIiwi"
    "dCI6IjdmNDUxZmM0LTYwMDEtNDVlNS05YmYxLThhNWYzOTExOTVmOSJ9"
)

# 2) If chromedriver is NOT on PATH, point to its location:
service = Service("P:\ML-Project\HospitalCare\chromedriver-win32\chromedriver.exe")
driver = webdriver.Chrome(service=service)

# 3) Set up headless Chrome
opts = Options()
# opts.add_argument("--headless")       # run in background
opts.add_argument("--disable-gpu")    # necessary on Windows

driver = webdriver.Chrome(options=opts)
driver.get(REPORT_URL)

# 4) Wait for the card visuals to load
wait = WebDriverWait(driver, 20)
wait.until(EC.presence_of_element_located(
    (By.CSS_SELECTOR, "div.visualContainer span.textRun")
))

# 5) Extract any textRun spans that contain digits
# find all of the card visuals' value nodes
tspans = driver.find_elements(By.CSS_SELECTOR, "svg.card text.value tspan")
values = [t.text for t in tspans]

print("Scraped card values:")
for v in values:
    print(" •", v)

driver.quit()