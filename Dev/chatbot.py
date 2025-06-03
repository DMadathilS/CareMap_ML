import streamlit as st
from kwc_walkin_scraper import get_kwc_walkin_clinics

def get_grh_wait_time():
    from selenium import webdriver
    from selenium.webdriver.firefox.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    opts = Options()
    opts.add_argument("--headless")
    driver = webdriver.Firefox(executable_path="geckodriver.exe", options=opts)

    try:
        driver.get("https://www.grhosp.on.ca/care/services-departments/emergency/current-emergency-wait")
        wait = WebDriverWait(driver, 20)
        wait_time = wait.until(EC.visibility_of_element_located((By.ID, "arrival-to-md"))).text.strip()
        patients = wait.until(EC.visibility_of_element_located((By.ID, "patients-waiting"))).text.strip()
        return f"GRH Emergency Wait Time: {wait_time}, Patients Waiting: {patients}"
    except Exception as e:
        return "Error fetching GRH data: " + str(e)
    finally:
        driver.quit()

def get_smgh_wait_time():
    from selenium import webdriver
    from selenium.webdriver.firefox.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    opts = Options()
    opts.add_argument("--headless")
    driver = webdriver.Firefox(executable_path="geckodriver.exe", options=opts)

    try:
        driver.get("https://www.smgh.ca/patients-visitors/emergency-department-wait-times")
        wait = WebDriverWait(driver, 20)
        iframe = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "iframe[src*='smgh-predict.oculys.com']")))
        driver.switch_to.frame(iframe)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#currentPatients span")))

        spans = driver.find_elements(By.CSS_SELECTOR, "#currentPatients span")
        being_treated = spans[0].text
        waiting = spans[1].text
        est_wait = driver.find_element(By.CSS_SELECTOR, "#mainStopwatch .stdStopwatchMiddleText").text
        timestamp = driver.find_element(By.CSS_SELECTOR, "#mainStopwatch .stdStopwatchBottomText").text

        return f"SMGH Estimated Wait: {est_wait}, Being Treated: {being_treated}, Waiting: {waiting}, Last Updated: {timestamp}"
    except Exception as e:
        return "Error fetching SMGH data: " + str(e)
    finally:
        driver.quit()

def get_wrhn_dashboard_data():
    from selenium import webdriver
    from selenium.webdriver.firefox.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    opts = Options()
    opts.add_argument("--headless")
    driver = webdriver.Firefox(executable_path="geckodriver.exe", options=opts)

    try:
        driver.get("https://app.powerbi.com/view?r=eyJrIjoiMDY3NjFiOTItZGQyYy00ZDU5LWFmMzQtYzkyNWU5ZGZjN2ZhIiwi"
                   "dCI6IjdmNDUxZmM0LTYwMDEtNDVlNS05YmYxLThhNWYzOTExOTVmOSJ9")
        wait = WebDriverWait(driver, 20)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.visualContainer span.textRun")))
        tspans = driver.find_elements(By.CSS_SELECTOR, "svg.card text.value tspan")
        values = [t.text for t in tspans]
        return "WRHN Dashboard Values: " + ", ".join(values)
    except Exception as e:
        return "Error fetching WRHN data: " + str(e)
    finally:
        driver.quit()

def launch_chatbot():
    st.subheader("Ask the CareMap Chatbot")
    st.markdown("🧠 *Try asking things like:* `GRH wait time`, `walk-in in Kitchener`, `WRHN dashboard`, `clinic near Conestoga`")
    user_input = st.text_input("How can I assist you today?")

    if user_input:
        query = user_input.lower()

        if "grh" in query:
            st.write(get_grh_wait_time())
        elif "smgh" in query:
            st.write(get_smgh_wait_time())
        elif "wrhn" in query:
            st.write(get_wrhn_dashboard_data())
        elif any(term in query for term in ["walk-in", "walkin", "clinic", "conestoga", "kitchener"]):
            with st.spinner("Searching for walk-in clinics..."):
                results = get_kwc_walkin_clinics()
                for line in results:
                    st.write("🏥 " + line)
        else:
            st.write("Try asking about GRH, SMGH, WRHN, or walk-in clinics in your area.")
