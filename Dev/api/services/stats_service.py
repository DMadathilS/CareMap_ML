import psycopg2
from collections import defaultdict
from statistics import mean
import os
from datetime import timedelta

# DB_PARAMS = {
#     "dbname":   "HealthCareTest",
#     "user":     os.environ["DB_USER"],
#     "password": os.environ["PG_PASSWORD"],
#     "host":     "localhost",
#     "port":     5432,
# }

DB_PARAMS = {
    "dbname":   os.environ["DB_NAME"],
    "user":     os.environ["DB_USER"],
    "password": os.environ["PG_PASSWORD"],
    "host":     os.environ["DB_HOST"],  # Use env var here!
    "port":     int(os.environ.get("DB_PORT", 5432)),  # default to 5432 if not set
}

# def get_hospital_stats():
#     conn = psycopg2.connect(**DB_PARAMS)
#     cur = conn.cursor()

#     query = """
#     SELECT source, timestamp, wait_minutes, patients_waiting
#     FROM public.wait_times
#     ORDER BY source, timestamp
#     """
#     cur.execute(query)
#     rows = cur.fetchall()

#     data_by_source = defaultdict(list)
#     all_waits = []
#     all_patients = []

#     for source, ts, wait, patients in rows:
#         data_by_source[source].append((ts, wait, patients))
#         all_waits.append(wait)
#         all_patients.append(patients)

#     stats = {}
#     for source, records in data_by_source.items():
#         waits = [r[1] for r in records]
#         patients = [r[2] for r in records]

#         current_wait = waits[-1]
#         current_patients=patients[-1]
#         average_wait = round(mean(waits), 2)
#         average_patient_time = round(mean(patients), 2)

#         # Get trend based on last 30 mins
#         recent_entries = get_recent_entries(records, minutes=30)
#         recent_waits = [r[1] for r in recent_entries]
#         trend = get_trend(recent_waits)

#         stats[source] = {
#             "currentWait": current_wait,
#             "averageWait": average_wait,
#             "trend": trend,
#             "averagePatientTime": average_patient_time,
#             "current_patients":current_patients
#         }

#     overall_avg_wait = round(mean(all_waits), 2) if all_waits else None
#     overall_avg_patients = round(mean(all_patients), 2) if all_patients else None

#     cur.close()
#     conn.close()

#     return {
#         "hospitals": stats,
#         "overallAverageWait": overall_avg_wait,
#         "overallAveragePatients": overall_avg_patients
#     }


def get_hospital_stats():
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()

    query = """
    WITH latest_data AS (
      SELECT DISTINCT ON (source)
        source,
        wait_minutes AS current_wait,
        patients_waiting AS current_patients,
        timestamp AS current_time
      FROM public.wait_times
      ORDER BY source, timestamp DESC
    ),
    recent_data AS (
      SELECT 
        source,
        MIN(wait_minutes) FILTER (WHERE timestamp >= NOW() - INTERVAL '30 minutes') AS min_recent,
        MAX(wait_minutes) FILTER (WHERE timestamp >= NOW() - INTERVAL '30 minutes') AS max_recent
      FROM public.wait_times
      GROUP BY source
    ),
    averages AS (
      SELECT 
        source,
        ROUND(AVG(wait_minutes)::numeric, 2) AS average_wait,
        ROUND(AVG(patients_waiting)::numeric, 2) AS average_patient_time
      FROM public.wait_times
      GROUP BY source
    ),
    hospital_json AS (
      SELECT 
        l.source,
        jsonb_build_object(
          'currentWait', l.current_wait,
          'averageWait', a.average_wait,
          'trend', 
            CASE 
              WHEN r.max_recent > r.min_recent THEN 'up'
              WHEN r.max_recent < r.min_recent THEN 'down'
              ELSE 'stable'
            END,
          'averagePatientTime', a.average_patient_time,
          'current_patients', l.current_patients
        ) AS value
      FROM latest_data l
      JOIN averages a ON l.source = a.source
      LEFT JOIN recent_data r ON l.source = r.source
    ),
    overall_avg AS (
      SELECT 
        ROUND(AVG(wait_minutes)::numeric, 2) AS overall_average_wait,
        ROUND(AVG(patients_waiting)::numeric, 2) AS overall_average_patients
      FROM public.wait_times
    )
    SELECT jsonb_build_object(
      'hospitals', jsonb_object_agg(h.source, h.value),
      'overallAverageWait', (SELECT overall_average_wait FROM overall_avg),
      'overallAveragePatients', (SELECT overall_average_patients FROM overall_avg)
    ) AS result
    FROM hospital_json h;
    """

    cur.execute(query)
    row = cur.fetchone()

    cur.close()
    conn.close()

    # Return as native Python dict
    return row[0] if row and row[0] else {}

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