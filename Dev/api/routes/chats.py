from fastapi import APIRouter, HTTPException
from api.services.user_service import get_user as get_user_svc
from api.services.chat_service import create_chat as create_chat_svc

router = APIRouter()

@router.post("/users/{user_id}/chats")
def create_chat_endpoint(user_id: str):
    """Create a new chat session for a given user."""
    # Verify the user exists
    if not get_user_svc(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return create_chat_svc(user_id)
