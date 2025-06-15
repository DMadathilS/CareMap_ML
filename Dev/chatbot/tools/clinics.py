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
