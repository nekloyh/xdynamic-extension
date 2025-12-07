import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# CORS middleware - Allow Chrome Extension and Production access
# Configure based on environment
if settings.DEBUG:
    # Development: Allow all
    cors_origins = [
        "*",
        "chrome-extension://*",
        "http://localhost:3000",
        "http://localhost:5173",
    ]
else:
    # Production: Specific domains
    cors_origins = [
        "https://app.xdynamic.cloud",
        "https://api.xdynamic.cloud",
        "https://admin.xdynamic.cloud",
        "chrome-extension://*",  # Allow Chrome extensions
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register routers (controllers already have /api prefix)
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


# Custom SPA handler for admin dashboard
class SPAStaticFiles(StaticFiles):
    """StaticFiles that returns index.html for all routes (SPA support)"""
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except Exception:
            # If file not found, return index.html for client-side routing
            return await super().get_response("index.html", scope)


# Serve static frontend pages
# In Docker: /app/frontend/* is mounted from host
# In local dev: ../../frontend/* relative to this file
frontend_base = Path("/app/frontend")
if not frontend_base.exists():
    # Running locally without Docker
    frontend_base = Path(__file__).resolve().parents[2] / "frontend"

# Serve callback pages (auth, payment redirects)
fe_callbacks_dir = frontend_base / "callback-pages"
if fe_callbacks_dir.exists():
    app.mount("/fe", StaticFiles(directory=str(fe_callbacks_dir), html=True), name="fe")
    logging.getLogger(__name__).info("Callback pages mounted at /fe")
else:
    logging.getLogger(__name__).warning("Callback pages not found at %s", fe_callbacks_dir)

# Serve admin dashboard with SPA support
admin_dist_dir = frontend_base / "admin-dashboard" / "dist"
if admin_dist_dir.exists():
    app.mount("/admin", SPAStaticFiles(directory=str(admin_dist_dir), html=True), name="admin")
    logging.getLogger(__name__).info("Admin dashboard mounted at /admin with SPA routing")
else:
    logging.getLogger(__name__).warning("Admin dashboard not found at %s. Run build first.", admin_dist_dir)
