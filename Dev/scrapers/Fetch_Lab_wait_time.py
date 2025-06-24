import os
import requests
import psycopg2
from datetime import datetime
def log_lab_availability():
    # --- CONFIG ---
    DB_PARAMS = {
        "dbname": "HealthCareTest",
        "user": "Deep",
        "password": "Deep@0506",
        "host": "localhost",
        "port": 5432,
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

    # --- Insert into lab_availability_log ---
    inserted = 0
    for lab in labs:
        location_id = lab.get("locationId")
        city = lab.get("locationAddress", {}).get("city", "")
        if city not in ALLOWED_CITIES:
            continue

        wait_time = lab.get("waitTime")
        appt_str = lab.get("nextAvailableAppointment")
        print(appt_str)
        appt_dt = None
        if appt_str:
            try:
                appt_dt = datetime.strptime(appt_str, "%m/%d/%Y %I:%M:%S %p")
                print(appt_dt)
            except Exception:
                print(f"❌ Failed to parse appointment time '{appt_str}': {e}")
        appt_dt            
        cur.execute("""
            INSERT INTO lab_availability_log (location_id, wait_time_minutes, next_available_appointment)
            VALUES (%s, %s, %s);
        """, (location_id, wait_time, appt_dt))

        inserted += 1

    # --- Finish ---
    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Inserted {inserted} records into lab_availability_log.")


