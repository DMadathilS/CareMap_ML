user_store = {}


def create_user(location: str, ip_address: str) -> dict:
    """
    Create and store a new user session.

    Args:
        location: "lat,lon" string
        ip_address: IP address string

    Returns:
        Dict with user_id, location, ip_address
    """
    from api.utils.uuid import generate_uuid
    user_id = generate_uuid()
    user_store[user_id] = {
        "location": location,
        "ip_address": ip_address
    }
    return {"user_id": user_id, "location": location, "ip_address": ip_address}


def get_user(user_id: str) -> dict | None:
    """
    Retrieve user session data by ID.

    Returns None if not found.
    """
    return user_store.get(user_id)