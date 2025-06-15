from chatbot.config import cur, PAGE_SIZE
from pgvector import Vector

def fetch_labs(query_emb, limit=PAGE_SIZE):
    sql = (
        "SELECT name, CONCAT(street, ', ', city, ' ', province) AS address, "
        "phone AS contact, instructions, embeddings <=> %s::vector AS score "
        "FROM lab_locations ORDER BY embeddings <=> %s::vector LIMIT %s;"
    )
    cur.execute(sql, (Vector(query_emb), Vector(query_emb), limit))
    rows = cur.fetchall()
    return [
        {
            "name": name,
            "address": address,
            "contact_info": contact,
            "languages": ["English"],
            "distance": score,
            "suggested": False,
            "llm_notes": "",
        }
        for name, address, contact, instructions, score in rows
    ]
