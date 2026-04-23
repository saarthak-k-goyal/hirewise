import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from db import get_db, close_db
from routes.auth import router as auth_router
from routes.analyze import router as analyze_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Hirewise API starting up...")
    try:
        db = get_db()
        # Ping MongoDB
        db.client.admin.command("ping")
        print("✅ Connected to MongoDB Atlas")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise

    yield

    # Shutdown
    print("🛑 Hirewise API shutting down...")
    close_db()
    print("✅ Database connection closed")


app = FastAPI(
    title="Hirewise API",
    description="AI-powered Resume + Job Description Matcher for Indian Job Seekers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(analyze_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Hirewise API",
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    try:
        db = get_db()
        db.client.admin.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy" if "error" not in db_status else "degraded",
        "database": db_status,
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred. Please try again.",
            "type": type(exc).__name__,
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )