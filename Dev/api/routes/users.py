from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.services.user_service import create_user as create_user_svc, get_user as get_user_svc

router = APIRouter()

class CreateUserPayload(BaseModel):
    location: str
    ip_address: str

@router.post("/users")
def create_user_endpoint(payload: CreateUserPayload):
    """
    Create a new guest user session.
    """
    return create_user_svc(payload.location, payload.ip_address)

@router.get("/users/{user_id}")
def get_user_endpoint(user_id: str):
    """
    Retrieve stored user session info.
    """
    user = get_user_svc(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id, **user}