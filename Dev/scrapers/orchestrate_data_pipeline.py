#!/usr/bin/env python3
"""
Orchestrator script to:
 1. Ensure PostgreSQL table exists.
 2. Every 5 minutes, fetch data from three sources (GRH, SMGH, WRHN),
    store snapshots into PostgreSQL.
 3. After each fetch cycle, extract the latest snapshot per source and
    write them to JSON and CSV files in the data/ folder for easy access.

Requires:
  - A .env with DATABASE_URL (e.g., postgresql://user:pass@host:port/dbname)
"""
import os
import time
import json
import csv
import schedule
import psycopg2
from dotenv import load_dotenv
from datetime import datetime, date, time as dtime
from zoneinfo import ZoneInfo
# Load environment variables from .env
load_dotenv()

# Database connection string
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")

# Import your fetcher functions
from fetch_EW_grhosp import fetch_emergency_data_grhosp  # GRH
from fetch_EW_smgh import fetch_smgh_wait_times  # SMGH
from smgh import fetch_powerbi_wait_times  # WRHN via PowerBI

# Paths for output
DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data-collection", "Real-time")
LATEST_JSON = os.path.join(DATA_DIR, "latest.json")
LATEST_CSV = os.path.join(DATA_DIR, "latest.csv")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)
# Timezone for storing website timestamps
LOCAL_TZ = ZoneInfo("America/Toronto")


def ensure_table_exists():
    """
    Create the wait_times table if it does not already exist,
    including the website_last_update column.
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS wait_times (
                  id SERIAL PRIMARY KEY,
                  source TEXT NOT NULL,
                  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                  wait_minutes INTEGER NOT NULL,
                  patients_waiting INTEGER NOT NULL,
                  website_last_update TIMESTAMPTZ NULL
                );
                """
            )
            cur.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_wait_times_source_timestamp
                  ON wait_times(source, timestamp DESC);
                """
            )
        conn.commit()
    finally:
        conn.close()


def insert_snapshot(conn, source: str, wait_mins: int, patients: int, website_last_update: datetime):
    """
    Insert a snapshot into the wait_times table, including the website's last update.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO wait_times (source, timestamp, wait_minutes, patients_waiting, website_last_update)
            VALUES (%s, NOW(), %s, %s, %s)
            """,
            (source, wait_mins, patients, website_last_update)
        )
    conn.commit()


def update_database():
    """
    Fetch data from each source and insert into PostgreSQL.
    """
    conn = psycopg2.connect(DATABASE_URL)
    try:
        # 1) GRH data
        grh = fetch_emergency_data_grhosp()
        print("grh",grh)
        insert_snapshot(
            conn,
            "Cambridge Memorial Hospital (cmh)",
            grh["wait_time_minutes"],
            grh["patients_waiting"],
            # ensure timezone-aware
            grh.get("last_updated").astimezone(LOCAL_TZ) if grh.get("last_updated") else None
        )

        # 2) SMGH data
        smgh = fetch_smgh_wait_times()
        print("smgh",smgh)

        insert_snapshot(
            conn,
            "St. Mary's General Hospital (smgh)",
            smgh["estimated_wait_time_minutes"],
            smgh["patients_waiting"],
            smgh.get("last_update").astimezone(LOCAL_TZ) if smgh.get("last_update") else None
        )

        # 3) WRHN data via PowerBI fetcher
        REPORT_URL = (
            "https://app.powerbi.com/view?"
            "r=eyJrIjoiMDY3NjFiOTItZGQyYy00ZDU5LWFmMzQtYzkyNWU5ZGZjN2ZhIiwi"
            "dCI6IjdmNDUxZmM0LTYwMDEtNDVlNS05YmYxLThhNWYzOTExOTVmOSJ9"
        )
        DRIVER_PATH = r"P:\ML-Project\HospitalCare\chromedriver-win32\chromedriver.exe"
        wrhn = fetch_powerbi_wait_times(REPORT_URL, DRIVER_PATH)
        print("wrhn",wrhn)

        # parse WRHN last_updated_time (HH:MM:SS) into datetime
        t = datetime.strptime(wrhn["last_updated_time"], "%H:%M:%S").time()
        website_ts = datetime.combine(date.today(), t, tzinfo=LOCAL_TZ)
        insert_snapshot(
            conn,
            "Grand River Hospital (wrhn)",
            # parse estimated_time HH:MM:SS → total minutes
            wrhn["estimated_time"],
            wrhn["patients_waiting"],
            website_ts
        )

    finally:
        conn.close()


def get_latest_snapshots():
    """
    Retrieve the latest snapshot for each source from PostgreSQL.
    Returns a dict keyed by source.
    """
    conn = psycopg2.connect(DATABASE_URL)
    latest = {}
    try:
        with conn.cursor() as cur:
            for source in ("Cambridge Memorial Hospital (cmh)", "St. Mary's General Hospital (smgh)", "Grand River Hospital (wrhn)"):
                cur.execute(
                    """
                    SELECT timestamp, wait_minutes, patients_waiting, website_last_update
                    FROM wait_times
                    WHERE source = %s
                    ORDER BY timestamp DESC
                    LIMIT 1
                    """,
                    (source,)
                )
                row = cur.fetchone()
                if row:
                    ts, wait_mins, patients, web_ts = row
                    latest[source] = {
                        "timestamp": ts.isoformat(),
                        "wait_minutes": wait_mins,
                        "patients_waiting": patients,
                        "website_last_update": web_ts.isoformat() if web_ts else None
                    }
    finally:
        conn.close()
    return latest

def format_wait_minutes(minutes: int) -> str:
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0:
        return f"{hours}h {mins}m" if mins > 0 else f"{hours}h"
    return f"{mins}m"

def write_latest_files(latest: dict):
    """
    Write the latest snapshots to JSON and CSV for easy LLM access.
    """
    # JSON
    formatted_latest = {
        src: {
            **data,
            "wait_minutes": format_wait_minutes(data["wait_minutes"])  # ← format here
        }
        for src, data in latest.items()
    }

    # Write formatted JSON
    with open(LATEST_JSON, "w", encoding="utf-8") as jf:
        json.dump(formatted_latest, jf, indent=2)

    # CSV: source,timestamp,wait_minutes,patients_waiting,website_last_update
    with open(LATEST_CSV, "w", newline='', encoding="utf-8") as cf:
        writer = csv.writer(cf)
        writer.writerow([
            "source", "timestamp", "wait_minutes", "patients_waiting", "website_last_update"
        ])
        for src, data in latest.items():
            writer.writerow([
            src,
            data["timestamp"],
            format_wait_minutes(data["wait_minutes"]),
            data["patients_waiting"],
            data.get("website_last_update")
        ])



def job():
    """
    The scheduled job: update DB and refresh latest files.
    """
    print(f"[{datetime.now().isoformat()}] Starting data fetch and store...")
    try:
        update_database()
        latest = get_latest_snapshots()
        print("✅ Latest snapshot sources retrieved:", list(latest.keys()))

        write_latest_files(latest)
        print(f"[{datetime.now().isoformat()}] Update complete.\n")
    except Exception as e:
        print(f"Error during update: {e}")


def main():
    # Ensure table exists before scheduling
    ensure_table_exists()

    # Schedule the job every 5 minutes
    schedule.every(5).minutes.do(job)

    print("Scheduler started: running job every 5 minutes.")
    # Run once at startup
    job()

    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    main()
