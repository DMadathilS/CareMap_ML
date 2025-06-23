from chatbot.config import cur, PAGE_SIZE
from pgvector import Vector

def fetch_labs(query_emb, limit=PAGE_SIZE):
    sql = (
        "SELECT id, name, CONCAT(street, ', ', city, ' ', province, ' ', postal_code) AS address, "
        "phone, latitude, longitude, instructions, embeddings <=> %s::vector AS score "
        "FROM lab_locations ORDER BY embeddings <=> %s::vector LIMIT %s;"
    )
    cur.execute(sql, (Vector(query_emb), Vector(query_emb), limit))
    rows = cur.fetchall()

    return [
        {
            "id": id_,
            "name": name,
            "address": address,
            "contact_info": phone,
            "latitude": latitude,
            "longitude": longitude,
            "desc": instructions,
            "languages": ["English"],
            "distance": float(score),
            "relevance_score": round(1 - float(score), 3),
            "suggested": False,
            "llm_notes": "",
        }
        for id_, name, address, phone, latitude, longitude, instructions, score in rows
    ]
