import os
import psycopg2
from fastapi import APIRouter, HTTPException, Query
from typing import List
from dotenv import load_dotenv

# Load env variables
load_dotenv()

router = APIRouter()

def get_db_connection():
    production = os.getenv("PRODUCTION", "false").lower() == "true"
    db_host = os.getenv("DB_HOST_DOCKER") if production else os.getenv("DB_HOST")

    DB_PARAMS = {
        "dbname": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("PG_PASSWORD"),
        "host": db_host,
        "port": os.getenv("DB_PORT")
    }

    return psycopg2.connect(**DB_PARAMS)


@router.get("/providers/by-category")
def get_providers_by_category(category: str = Query(..., description="e.g. Dentist")):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = """
            SELECT id, provider_id, provider_name, address, phone_number, latitude, longitude,
                   website, description, category, opening_hours
            FROM tbl_providers_new
            WHERE LOWER(category) = LOWER(%s)
        """

        cur.execute(query, (category,))
        rows = cur.fetchall()

        providers = []
        for row in rows:
            providers.append({
                "id": row[0],
                "provider_id": row[1],
                "provider_name": row[2],
                "address": row[3],
                "phone_number": row[4],
                "latitude": row[5],
                "longitude": row[6],
                "website": row[7],
                "description": row[8],
                "category": row[9],
                "opening_hours": row[10],
            })

        cur.close()
        conn.close()

        return providers if providers else {"message": "No providers found for this category."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# routes/providers.py


@router.get("/CareMap/api/provider-category-stats")
def get_category_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT category, COUNT(*) 
        FROM tbl_providers_new 
        GROUP BY category
        ORDER BY COUNT(*) DESC;
    """)
    results = [{"category": row[0], "count": row[1]} for row in cursor.fetchall()]
    conn.close()
    return results
