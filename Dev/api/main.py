# api/main.py
import uvicorn
from fastapi import FastAPI
from config import settings
from routes.users import router as users_router

app = FastAPI()

# mount under the BASE_PATH from .env
app.include_router(users_router, prefix=settings.BASE_PATH)

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True
    )
