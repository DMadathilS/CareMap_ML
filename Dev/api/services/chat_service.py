dict_chat_store: dict[str, dict] = {}

def create_chat(user_id: str) -> dict:
    """
    Create a new chat session for a given user.

    Args:
        user_id: string UUID of the guest user

    Returns:
        A dict containing the new chat_id and the associated user_id
    """
    from Dev.api.utils.uuid import generate_uuid
    chat_id = generate_uuid()
    dict_chat_store[chat_id] = {"user_id": user_id}
    return {"chat_id": chat_id, "user_id": user_id}


def get_chat(chat_id: str) -> dict | None:
    """
    Retrieve chat session data by ID.

    Args:
        chat_id: string UUID of the chat session

    Returns:
        The chat session dict if found, else None
    """
    return dict_chat_store.get(chat_id)