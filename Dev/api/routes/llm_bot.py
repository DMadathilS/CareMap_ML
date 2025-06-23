from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from chatbot.router import QueryBasedRouter
from typing import Optional

router = APIRouter()
llm_router = QueryBasedRouter()

class LLMQuery(BaseModel):
    query: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/llm/query")
def handle_llm_query(input: LLMQuery):
    """Route user query to appropriate domain and generate AI-assisted response."""
    try:
        return llm_router.run(
            query=input.query,
            user_lat=input.latitude,
            user_lon=input.longitude
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")
