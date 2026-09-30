"""Dompet Gizi — Backend API Service

FastAPI backend for Dompet Gizi, an AI-powered nutrition assistant
for Indonesian college students (anak kost).

Run with: uvicorn main:app --reload
"""

import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.router import api_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    logger.info("🥗 Dompet Gizi API starting up...")
    settings = get_settings()
    configured = sum([
        bool(settings.GEMINI_API_KEY),
        bool(settings.GROQ_API_KEY),
        bool(settings.MISTRAL_API_KEY),
        bool(settings.OPENROUTER_API_KEY),
    ])
    logger.info(f"   AI Providers configured: {configured}/4")
    yield
    logger.info("🥗 Dompet Gizi API shutting down...")


app = FastAPI(
    title="Dompet Gizi API",
    description="AI-powered nutrition assistant API for Indonesian college students",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "success": True,
        "message": "Welcome to Dompet Gizi API",
        "data": {
            "docs": "/docs",
            "health": "/api/health",
        },
    }
