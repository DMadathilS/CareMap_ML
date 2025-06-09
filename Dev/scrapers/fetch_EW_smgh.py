#!/usr/bin/env python3
"""
Fetch current emergency wait times from SMGH and return structured data,
with timestamps converted to Canada (Toronto) timezone.
"""

import requests
from datetime import datetime
from zoneinfo import ZoneInfo

URL = "https://smgh-predict.oculys.com/api/WaitTimes/?clientId=SMGH"
CANADA_TZ = ZoneInfo("America/Toronto")


def fetch_smgh_wait_times():
    """
    Fetch emergency department wait data from SMGH.

    Returns:
        dict: {
            'patients_in_treatment': int,
            'patients_waiting': int,
            'total_patients': int,
            'estimated_wait_time_hours': float,
            'estimated_wait_time_minutes': int,
            'formatted_wait_time': str,
            'last_update': datetime  # timezone-aware
        }
    """
    response = requests.get(URL, timeout=10)
    response.raise_for_status()
    data = response.json()

    site = data.get("sites", [])[0] if data.get("sites") else {}
    patients_in_treatment = int(site.get("patientsInTreatment", 0))
    patients_waiting = int(site.get("patientsWaiting", 0))
    total_patients = int(site.get("totalPatients", 0))
    est_hours = float(site.get("estimatedWaitTime", 0.0))

    # Convert hours to minutes and format as Hh Mm or Ym
    wait_minutes = int(est_hours * 60)
    hours, minutes = divmod(wait_minutes, 60)
    formatted = f"{hours}h {minutes}m" if hours else f"{minutes}m"

    # Parse ISO UTC timestamp and convert to Canada timezone
    last_update_str = site.get("lastUpdate")
    last_update = None
    if last_update_str:
        try:
            # Remove trailing 'Z', parse as UTC
            dt_utc = datetime.fromisoformat(last_update_str.rstrip('Z')).replace(tzinfo=ZoneInfo('UTC'))
            last_update = dt_utc.astimezone(CANADA_TZ)
        except Exception:
            last_update = None

    return {
        "patients_in_treatment": patients_in_treatment,
        "patients_waiting": patients_waiting,
        "total_patients": total_patients,
        "estimated_wait_time_hours": est_hours,
        "estimated_wait_time_minutes": wait_minutes,
        "formatted_wait_time": formatted,
        "last_update": last_update
    }


if __name__ == "__main__":
    result = fetch_smgh_wait_times()
    print(f"Patients in Treatment: {result['patients_in_treatment']}")
    print(f"Patients Waiting:      {result['patients_waiting']}")
    print(f"Total Patients:        {result['total_patients']}")
    print(f"Estimated Wait:        {result['formatted_wait_time']}")
    if result['last_update']:
        print(f"Last Update (Toronto): {result['last_update'].strftime('%Y-%m-%d %H:%M:%S %Z')}")
    else:
        print("Last Update:           Unknown")
