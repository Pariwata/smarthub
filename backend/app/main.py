"""
SmartHub Law-Reg Change Intelligent System
Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

from app.config import settings
from app.api.v1 import regulations, changes, analysis, health

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    SmartHub Law-Reg Change Intelligent System

    An intelligent system for tracking, analyzing, and managing regulatory changes.

    ## Features

    * **Regulation Management** - Create, read, update, and track regulations
    * **Change Detection** - Automatically detect changes between regulation versions
    * **AI Analysis** - AI-powered analysis of regulatory changes
    * **Impact Assessment** - Assess business and compliance impact
    * **Risk Scoring** - Calculate risk scores for changes
    * **Recommendations** - Generate actionable compliance recommendations

    ## Endpoints

    * `/api/v1/regulations` - Regulation management
    * `/api/v1/changes` - Change tracking and analysis
    * `/api/v1/analysis` - Advanced analysis and reporting
    * `/api/v1/health` - Health check
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.API_V1_PREFIX, tags=["Health"])
app.include_router(
    regulations.router, prefix=settings.API_V1_PREFIX, tags=["Regulations"]
)
app.include_router(changes.router, prefix=settings.API_V1_PREFIX, tags=["Changes"])
app.include_router(analysis.router, prefix=settings.API_V1_PREFIX, tags=["Analysis"])


@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Debug mode: {settings.DEBUG}")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info(f"Shutting down {settings.APP_NAME}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
