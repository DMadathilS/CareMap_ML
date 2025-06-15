# api/main.py

import uvicorn
from fastapi import FastAPI
from api.config import settings
from api.routes.users import router as users_router
from api.routes.llm_bot import router as llm_router  # ✅ Import this

app = FastAPI()

# Mount both under base path
app.include_router(users_router, prefix=settings.BASE_PATH)
app.include_router(llm_router, prefix=f"{settings.BASE_PATH}")

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True
    )
