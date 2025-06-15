# CareMap_ML – Dev Folder

This folder contains the core application logic that powers the CareMap_ML platform, including the chatbot interface, interactive dashboard, and real-time clinic data scraping components.


## 1. `chatbot.py`

This is the main logic for the CareMap chatbot. It is built using Streamlit and integrates various real-time data sources:

- Fetches emergency room wait times from **Grand River Hospital (GRH)** and **St. Mary’s General Hospital (SMGH)** using Selenium.
- Pulls summary metrics from a **Power BI dashboard** (WRHN).
- Calls the walk-in clinic search logic from `kwc_walkin_scraper.py`.
- Based on user input, the chatbot responds with live hospital/clinic info or guidance.

Users can ask questions like:
- “What is the GRH wait time?”
- “Show clinics near Conestoga”
- “WRHN stats”  
and the bot will return current healthcare data.


## 2. `dashboard.py`

This script launches an interactive map-based dashboard built with Streamlit and Folium:

- Reads healthcare facility data from a CSV file (`data/facilities.csv`).
- Allows users to filter by region, facility type, and emergency level.
- Displays filtered facilities as markers on a live map.
- Also shows a table of facility details beneath the map.

This component is designed for both public users and policymakers to visually explore underserved healthcare zones.


## 3. `kwc_walkin_scraper.py`

This is a standalone utility that uses Selenium with Firefox to search for walk-in clinics in the Kitchener area via [211Ontario.ca](https://211ontario.ca):

- Searches for "walk-in clinic Kitchener"
- Clicks through results and collects names and addresses
- Returns a list of up to 5 clinics
- Handles English-language button clicks and waits for results to load

It is used by `chatbot.py` to provide up-to-date walk-in clinic recommendations.


## Running the Components

To launch the chatbot or dashboard:

```bash
# Chatbot
streamlit run chatbot.py

# Dashboard
streamlit run dashboard.py
