from chatbot.config import cur, PAGE_SIZE
from pgvector import Vector

def fetch_providers(query_emb, limit=PAGE_SIZE):
    sql = """
    SELECT id, provider_name, address, phone_number, latitude, longitude,
           opening_hours, website, description, embeddings <=> %s::vector AS score
    FROM tbl_providers
    ORDER BY embeddings <=> %s::vector
    LIMIT %s;
    """
    cur.execute(sql, (Vector(query_emb), Vector(query_emb), limit))
    rows = cur.fetchall()
    return [
        {
            "id": id,
            "name": name,
            "address": addr,
            "contact_info": f"phone: {phone}, website: {site}",
            "latitude": lat,
            "longitude": lon,
            "languages": ["English"],
            "desc": desc,
            "opening_hours": oh,
            "suggested": False,
            "llm_notes": "",
            "distance": float(score),
            "relevance_score": round(1 - float(score), 3),

        }
        for id, name, addr, phone, lat, lon, oh, site, desc, score in rows
    ]
