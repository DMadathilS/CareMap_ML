# Real-Time Healthcare Data Scrapers (Selenium)

This folder includes a set of Python scripts built with Selenium that are used to scrape live data from hospital and clinic websites in Ontario. These scripts play a crucial role in powering our CareMap_ML dashboard and chatbot by providing real-time insights into healthcare availability in the Kitchener-Waterloo-Cambridge (KWC) area.

Each script targets a different source or type of healthcare data:

1. **grhosp.py**  
   This script connects to the Grand River Hospital emergency wait time page. It waits for the web elements showing the current emergency department wait time and the number of patients waiting to load, then extracts and prints these values. This information helps users understand the current load at GRH.

2. **kwc_walkin_scraper.py**  
   This script automates a search on the 211Ontario.ca website for “walk-in clinic Kitchener.” It simulates entering the search term, clicks the search button, and collects the top 5 clinic listings shown. Each listing includes the clinic name and address. This allows us to show nearby walk-in clinic options to users.

3. **smgh.py**  
   This script opens a shared Power BI report link and scrapes the card values displayed on the dashboard. These values are typically key metrics such as number of patients, wait times, or other performance indicators related to healthcare. This helps us feed summarized data into our visual dashboard in near real-time.

4. **WRHN.py**  
   This script visits St. Mary’s General Hospital’s emergency wait time page. Since the actual data is inside an iframe, the script waits for the iframe to load, switches into it, and scrapes the number of patients being treated, number waiting, estimated wait time, and last updated time. This detailed data is useful for comparing ER loads across facilities.


## How to Use These Scripts

To run any of the scrapers:

1. Make sure you have Python installed on your system.
2. Install Selenium with `pip install selenium`.
3. Make sure you have the right version of ChromeDriver installed. The path to the driver must be set correctly in each script.
4. Open a terminal in this folder and run the desired script, for example:

```bash
python grhosp.py
