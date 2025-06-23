from fastapi import APIRouter
from fastapi.responses import JSONResponse
from api.services.stats_service import get_hospital_stats,get_category_stats

router = APIRouter()

@router.get("/stats")
def hospital_stats():
    data = get_hospital_stats()
    return JSONResponse(content=data)

@router.get("/provider-category-stats")
def provider_category_stats():
    data = get_category_stats()
    return JSONResponse(content=data)