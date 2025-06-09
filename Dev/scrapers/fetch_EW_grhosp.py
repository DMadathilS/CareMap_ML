#!/usr/bin/env python3
"""
Fetch current emergency wait times from GRH (Waterloo Regional Health Network - Midtown site) and return structured data.
"""

import requests
from datetime import datetime

URL = "https://www.grhosp.on.ca/assets/documents/current-emergency-waits.json"
REFRESH_INTERVAL_MINUTES = 15

def fetch_emergency_data_grhosp():
    """
    Fetch emergency department wait data from GRH.

    Returns:
        dict: {
            'wait_time_minutes': int,
            'formatted_wait_time': str,
            'patients_waiting': int,
            'last_updated': datetime,
            'refresh_interval_minutes': int
        }
    """
    response = requests.get(URL, timeout=10)
    response.raise_for_status()
    data = response.json()

    # Raw values
    wait_minutes = int(data.get("arrival-to-md", 0))
    patients_waiting = int(data.get("patients-waiting", 0))
    date_created_str = data.get("date-created", "")

    # Parse 'DD-MM-YYYY HH:MM:SS'
    try:
        last_updated = datetime.strptime(date_created_str, "%d-%m-%Y %H:%M:%S")
    except ValueError:
        # Fallback to ISO format if needed
        last_updated = datetime.fromisoformat(date_created_str)

    # Format wait time as "Xh Ym" or "Ym"
    hours, minutes = divmod(wait_minutes, 60)
    formatted = f"{hours}h {minutes}m" if hours else f"{minutes}m"

    return {
        "wait_time_minutes": wait_minutes,
        "formatted_wait_time": formatted,
        "patients_waiting": patients_waiting,
        "last_updated": last_updated,
        "refresh_interval_minutes": REFRESH_INTERVAL_MINUTES
    }

if __name__ == "__main__":
    result = fetch_emergency_data_grhosp()
    print(f"Emergency Wait Time: {result['formatted_wait_time']}")
    print(f"Patients Waiting: {result['patients_waiting']}")
    print(f"Last Updated: {result['last_updated'].strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Refresh Interval: {result['refresh_interval_minutes']} minutes")
