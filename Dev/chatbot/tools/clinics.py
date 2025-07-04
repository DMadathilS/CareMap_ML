from chatbot.config import cur, PAGE_SIZE
from pgvector import Vector

def fetch_hospital_clinic(query_emb, limit=PAGE_SIZE, offset=0):
    sql = (
        "SELECT id, name, latitude, longitude, address, contact_info, languages, embedding <=> %s::vector AS distance "
        "FROM healthcare_services ORDER BY distance LIMIT %s OFFSET %s;"
    )
    cur.execute(sql, (Vector(query_emb), limit, offset))
    rows = cur.fetchall()
    keys = ["id", "name", "latitude", "longitude", "address", "contact_info", "languages", "distance"]
    return [dict(zip(keys, row)) | {"suggested": False, "llm_notes": ""} for row in rows]

def fetch_hospital_clinic_all_columns(query_emb, limit=PAGE_SIZE, offset=0):
    sql = """
        SELECT id, service_name, category, eligibility, accessibility, referral_method,
               languages, address, city, postal_code, state,
               phone, fax, website, latitude, longitude, description,
               embedding <=> %s::vector AS distance
        FROM healthcare_services_NEW
        ORDER BY distance
        LIMIT %s OFFSET %s;
    """
    cur.execute(sql, (Vector(query_emb), limit, offset))
    rows = cur.fetchall()

    keys = [
        "id", "service_name", "category", "eligibility", "accessibility", "referral_method",
        "languages", "address", "city", "postal_code", "state",
        "phone", "fax", "website", "latitude", "longitude", "description", "distance"
    ]

    results = []
    for row in rows:
        record = dict(zip(keys, row))

        full_address = f"{record['address']}, {record['city']}, {record['state']}, {record['postal_code']}"
        contact_info = ", ".join(filter(None, [
            f"phone: {record['phone']}" if record['phone'] else "",
            f"fax: {record['fax']}" if record['fax'] else "",
            f"url: {record['website']}" if record['website'] else ""
        ]))

        result = {
            "service_name": record["service_name"],
            "category": ", ".join(record["category"]) if isinstance(record["category"], list) else record["category"],
            "eligibility": record["eligibility"],
            "accessibility": record["accessibility"],
            "referral_method": record["referral_method"],
            "languages": record["languages"],
            "address": full_address,
            "contact_info": contact_info,
            "latitude": record["latitude"],
            "longitude": record["longitude"],
            "description": record["description"],
            "distance": record["distance"],
            "suggested": False,
            "llm_notes": ""
        }

        results.append(result)

    return results