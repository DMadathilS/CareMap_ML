from typing import Optional, List
from pydantic import BaseModel

class HealthcareItem(BaseModel):
    id: Optional[int] = None
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_info: Optional[str] = None
    languages: Optional[List[str]] = []
    distance: Optional[float] = None
    suggested: bool
    desc: Optional[str] = None
    llm_notes: Optional[str] = None
    relevance_score: Optional[float] = None
    wait_time_minutes: Optional[int] = None
    next_available_appointment: Optional[str] = None
    hours_of_operation: Optional[List[dict]] = []

class AssistantOutput(BaseModel):
    domain: Optional[str]
    data: List[HealthcareItem]
    answer: str
