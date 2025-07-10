#!/usr/bin/env python3
"""
Fetch and parse wait-time data from a Power BI report using Selenium.
"""
import json
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager  # ✅ Added


def fetch_powerbi_wait_times(report_url: str,timeout: int = 20) -> dict:
    """
    Load a Power BI report page, scrape the emergency wait card, and return structured data.

    Args:
        report_url: URL of the Power BI report containing the wait-time card.
        driver_path: Filepath to the chromedriver executable.
        timeout: Maximum seconds to wait for the card to load.

    Returns:
        A dict with:
          - estimated_time: "HH:MM:SS" formatted string
          - patients_waiting: int
          - last_updated_time: "HH:MM:SS" formatted string

    Raises:
        Exception: if scraping or parsing fails.
    """
    # Configure headless Chrome
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--remote-debugging-port=9222")

    service = Service("/usr/bin/chromedriver")  # already installed
    driver = webdriver.Chrome(service=service, options=opts)
    try:
        driver.get(report_url)
        # Wait for the visual card to load
        wait = WebDriverWait(driver, timeout)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "svg.card text.value tspan")))

        # Extract the three values
        tspans = driver.find_elements(By.CSS_SELECTOR, "svg.card text.value tspan")
        values = [el.text for el in tspans]
        if len(values) < 3:
            raise ValueError(f"Expected 3 values, found {len(values)}: {values}")

        estimated_str, patients_str, last_updated_str = values

        m = re.match(r"(?P<h>\d+)h(?P<m>\d+)m", estimated_str)
        if m:
            hours = int(m.group("h"))
            mins  = int(m.group("m"))
        else:
            hours, mins = 0, 0

        # total wait time in minutes as an integer
        estimated_minutes = hours * 60 + mins

        print(estimated_minutes)  # 4*60 + 1 = 241

        # Parse last updated time (e.g., "02:13 PM")
        dt = datetime.strptime(last_updated_str, "%I:%M %p")
        formatted_last = dt.strftime("%H:%M:%S")

        return {
            "estimated_time": estimated_minutes,
            "patients_waiting": int(patients_str),
            "last_updated_time": formatted_last
        }

    finally:
        driver.quit()


if __name__ == "__main__":
    # Example usage
    REPORT_URL = (
        "https://app.powerbi.com/view?"
        "r=eyJrIjoiMDY3NjFiOTItZGQyYy00ZDU5LWFmMzQtYzkyNWU5ZGZjN2ZhIiwi"
        "dCI6IjdmNDUxZmM0LTYwMDEtNDVlNS05YmYxLThhNWYzOTExOTVmOSJ9"
    )
    DRIVER_PATH = r"P:\ML-Project\HospitalCare\chromedriver-win32\chromedriver.exe"
    result = fetch_powerbi_wait_times(REPORT_URL, DRIVER_PATH)
    print(json.dumps(result, indent=2))
