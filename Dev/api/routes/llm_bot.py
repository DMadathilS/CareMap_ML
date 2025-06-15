from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from chatbot.router import QueryBasedRouter

router = APIRouter()
llm_router = QueryBasedRouter()

class LLMQuery(BaseModel):
    query: str

@router.post("/llm/query")
def handle_llm_query(input: LLMQuery):
    """Route user query to appropriate domain and generate AI-assisted response."""
    try:
        return llm_router.run(input.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")
