import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import get_settings
from app.database import init_db
from app.api import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS middleware - Allow Chrome Extension access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins for development
        "chrome-extension://*",  # Allow Chrome extensions
        "http://localhost:3000",  # Allow local development
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register routers via a single api router
app.include_router(api_router)


@app.get("/")
def root():
    """API root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "ok",
        "endpoints": {
        "auth": "/api/auth",
        "payment": "/api/payment",
        "subscription": "/api/subscription",
        "prediction": "/api/v1",
        "admin": "/api/admin",
        "docs": "/docs"
    }
}


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok"}

# Serve static callback/payment pages for dev flows (kept outside backend code)
if settings.DEBUG:
    repo_root = Path(__file__).resolve().parents[2]
    fe_callbacks_dir = repo_root / "frontend" / "callback-pages"
    
    if fe_callbacks_dir.exists():
        app.mount("/fe", StaticFiles(directory=fe_callbacks_dir, html=True), name="fe")
    else:
        logging.getLogger(__name__).warning("Callback pages not found at %s", fe_callbacks_dir)
