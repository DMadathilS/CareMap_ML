from Dev.api.services.user_service import user_store

def get_user_store():
    """
    Dependency returning the in-memory user store.
    """
    return user_store