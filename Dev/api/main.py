import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # ✅ Import CORS middleware
from api.config import settings
from api.routes.users import router as users_router
from api.routes.llm_bot import router as llm_router
from api.routes.chats import router as chat_router
from api.routes.stats import router as stats_router

app = FastAPI()

# ✅ ALLOW frontend origin
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # React dev server (optional)
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Or use ["*"] for all origins during dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under base path
app.include_router(users_router, prefix=settings.BASE_PATH)
app.include_router(llm_router, prefix=settings.BASE_PATH)
app.include_router(chat_router, prefix=settings.BASE_PATH)
app.include_router(stats_router, prefix=settings.BASE_PATH)

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True
    )
