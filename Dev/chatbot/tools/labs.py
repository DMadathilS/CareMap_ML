from chatbot.config import cur, PAGE_SIZE
from pgvector import Vector

def fetch_labs(query_emb, limit=PAGE_SIZE):
    sql = """
    SELECT
        l.location_id,
        l.name,
        CONCAT(l.street, ', ', l.city, ' ', l.province, ' ', l.postal_code) AS address,
        l.phone,
        l.latitude,
        l.longitude,
        l.instructions,
        (
            SELECT json_agg(json_build_object(
                'day_of_week', h.day_of_week,
                'open_time', h.open_time,
                'close_time', h.close_time,
                'closed', h.closed
            ))
            FROM hours_of_operation h
            WHERE h.location_id = l.location_id
        ) AS hours,
        lav.wait_time_minutes,
        lav.next_available_appointment,
        l.embeddings <=> %s::vector AS score
    FROM lab_locations_KWC l
    LEFT JOIN LATERAL (
        SELECT lav.wait_time_minutes, lav.next_available_appointment
        FROM lab_availability_log lav
        WHERE lav.location_id = l.location_id
        ORDER BY lav.logged_at DESC
        LIMIT 1
    ) lav ON TRUE
    ORDER BY score
    LIMIT %s;
    """

    cur.execute(sql, (Vector(query_emb), limit))
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
            "wait_time_minutes": wait_time,
            "next_available_appointment": next_appt.isoformat() if next_appt else None,
            "hours_of_operation": hours,
            "distance": float(score),
            "relevance_score": round(1 - float(score), 3),
            "suggested": False,
            "llm_notes": "",
        }
        for id_, name, address, phone, latitude, longitude, instructions, hours, wait_time, next_appt, score in rows
    ]
