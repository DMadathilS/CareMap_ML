import psycopg2
from collections import defaultdict
from statistics import mean
import os
from datetime import timedelta

DB_PARAMS = {
    "dbname":   "HealthCareTest",
    "user":     os.environ["DB_USER"],
    "password": os.environ["PG_PASSWORD"],
    "host":     "localhost",
    "port":     5432,
}

def get_hospital_stats():
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()

    query = """
    SELECT source, timestamp, wait_minutes, patients_waiting
    FROM public.wait_times
    ORDER BY source, timestamp
    """
    cur.execute(query)
    rows = cur.fetchall()

    data_by_source = defaultdict(list)
    all_waits = []
    all_patients = []

    for source, ts, wait, patients in rows:
        data_by_source[source].append((ts, wait, patients))
        all_waits.append(wait)
        all_patients.append(patients)

    stats = {}
    for source, records in data_by_source.items():
        waits = [r[1] for r in records]
        patients = [r[2] for r in records]

        current_wait = waits[-1]
        current_patients=patients[-1]
        average_wait = round(mean(waits), 2)
        average_patient_time = round(mean(patients), 2)

        # Get trend based on last 30 mins
        recent_entries = get_recent_entries(records, minutes=30)
        recent_waits = [r[1] for r in recent_entries]
        trend = get_trend(recent_waits)

        stats[source] = {
            "currentWait": current_wait,
            "averageWait": average_wait,
            "trend": trend,
            "averagePatientTime": average_patient_time,
            "current_patients":current_patients
        }

    overall_avg_wait = round(mean(all_waits), 2) if all_waits else None
    overall_avg_patients = round(mean(all_patients), 2) if all_patients else None

    cur.close()
    conn.close()

    return {
        "hospitals": stats,
        "overallAverageWait": overall_avg_wait,
        "overallAveragePatients": overall_avg_patients
    }

def get_recent_entries(records, minutes=30):
    from datetime import datetime

    now = records[-1][0]  # assume records are sorted
    cutoff = now - timedelta(minutes=minutes)
    return [r for r in records if r[0] >= cutoff]

def get_trend(wait_list):
    if len(wait_list) < 3:
        return "stable"
    if wait_list[-1] > wait_list[-2] > wait_list[-3]:
        return "up"
    elif wait_list[-1] < wait_list[-2] < wait_list[-3]:
        return "down"
    else:
        return "stable"

def get_category_stats():
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()

    # Query 1: Provider categories
    query1 = """
    SELECT category, COUNT(*) AS count
    FROM public.tbl_providers_new
    WHERE LOWER(address) LIKE '%kitchener%'
       OR LOWER(address) LIKE '%waterloo%'
       OR LOWER(address) LIKE '%cambridge%'
    GROUP BY category
    ORDER BY count DESC;
    """
    cur.execute(query1)
    provider_rows = cur.fetchall()

    # Convert to dict for easier merging
    category_counts = {row[0]: row[1] for row in provider_rows}

    # Query 2: Lab locations count
    query2 = """
    SELECT COUNT(id)
    FROM public.lab_locations
    WHERE LOWER(city) IN ('kitchener', 'waterloo', 'cambridge');
    """
    cur.execute(query2)
    lab_count = cur.fetchone()[0]

    # Merge lab count into category counts
    if "Lab / Diagnostic Provider" in category_counts:
        category_counts["Lab / Diagnostic Provider"] += lab_count
    else:
        category_counts["Lab / Diagnostic Provider"] = lab_count

    cur.close()
    conn.close()

    # Format result
    return [{"category": k, "count": v} for k, v in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)]