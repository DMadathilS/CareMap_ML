import os
import requests
import psycopg2
from datetime import datetime
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from project_logger.scraper_logger import scraper_logger
def log_lab_availability():
    production = os.getenv("PRODUCTION", "false").lower() == "true"
    db_host = os.getenv("DB_HOST_DOCKER") if production else os.getenv("DB_HOST")

    DB_PARAMS = {
        "dbname": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("PG_PASSWORD"),
        "host": db_host,
        "port": os.getenv("DB_PORT")
    }

    API_URL = "https://on-api.mycarecompass.lifelabs.com/api/LocationFinder/GetLocations/"
    ALLOWED_CITIES = {"Kitchener", "Waterloo", "Cambridge"}
    PAYLOAD = {
        "address": "waterloo",
        "locationCoordinate": {"latitude": 0, "longitude": 0},
        "locationFinderSearchFilters": {
            "isOpenEarlySelected": False,
            "isOpenWeekendsSelected": False,
            "isOpenSundaysSelected": False,
            "isWheelchairAccessibleSelected": False,
            "isDoesECGSelected": False,
            "isDoes24HourHolterMonitoringSelected": False,
            "isDoesAmbulatoryBloodPressureMonitoringSelected": False,
            "isDoesServeAutismSelected": False,
            "isGetCheckedOnlineSelected": False,
            "isOpenSaturdaysSelected": False,
            "isCovid19TestingSiteSelected": False,
        },
        "NumberOfLocationsToShow": 15
    }

    # --- Connect to DB ---
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()

    # --- Ensure lab_availability_log table exists ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS lab_availability_log (
        id                         SERIAL PRIMARY KEY,
        location_id                INTEGER REFERENCES lab_locations_KWC(location_id) ON DELETE CASCADE,
        logged_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        wait_time_minutes          INTEGER,
        next_available_appointment TIMESTAMP
    );
    """)
    conn.commit()

    # --- Fetch Lab Data ---
    response = requests.post(API_URL, json=PAYLOAD)
    labs = response.json().get("entity", [])

    inserted = 0
    for lab in labs:
        location_id = lab.get("locationId")
        city = lab.get("locationAddress", {}).get("city", "")
        if city not in ALLOWED_CITIES:
            continue

        wait_time = lab.get("waitTime")
        appt_str = lab.get("nextAvailableAppointment")
        appt_dt = None
        if appt_str:
            try:
                appt_dt = datetime.strptime(appt_str, "%Y-%m-%d %I:%M:%S %p")
            except Exception as e:
                print(f"Failed to parse appointment time '{appt_str}': {e}")
                # scraper_logger.warning(
                #     f"Failed to parse appointment time '{appt_str}': {e}",
                #     extra={
                #         "status": "error",
                #         "source": "lifelabs",
                #         "category": "datetime_parse",
                #         "entity": lab.get("locationName", "unknown")
                #     }
                # )

        cur.execute("""
            INSERT INTO lab_availability_log (location_id, wait_time_minutes, next_available_appointment)
            VALUES (%s, %s, %s);
        """, (location_id, wait_time, appt_dt))

        scraper_logger.info(
            "Inserted lab availability data into database",
            extra={
                "status": "success",
                "source": "lifelabs",
                "category": "db_insert",
                "entity": lab.get("locationName", "unknown")
            }
        )

        inserted += 1

    conn.commit()
    cur.close()
    conn.close()

    scraper_logger.info(
        f"Inserted {inserted} total lab records.",
        extra={
            "status": "success",
            "source": "lifelabs",
            "category": "db_insert",
            "entity": "lab_availability_log"
        }
    )
