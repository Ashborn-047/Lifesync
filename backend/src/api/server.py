"""
LifeSync Personality Engine - FastAPI Server
REST API for personality assessment scoring and explanation generation
"""

import asyncio
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from limits import parse
from contextlib import asynccontextmanager
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from src.api.middleware.logging_middleware import LoggingMiddleware
from src.db.cache import get_cache_stats

# Load environment variables from .env file
load_dotenv()

# Monkey-patch Limiter class to add check_for_limits method
async def check_for_limits(self, request: Request, limit_string: str):
    """
    Check if rate limit is exceeded for the given limit string.
    Endpoint-specific namespacing is applied to prevent shared limits across routes.
    """
    # Get the base key (IP address)
    key = get_remote_address(request)
    # Add namespace to separate different endpoints
    namespace = request.url.path
    full_key = f"{key}:{namespace}"
    
    # Parse the limit string
    limit_item = parse(limit_string)
    
    # Check if limit is exceeded
    if not self.limiter.hit(limit_item, full_key):
         # Wrapper to add error_message attribute which slowapi expects
         class LimitWrapper:
             def __init__(self, limit, error_message):
                 self.limit = limit
                 self.error_message = error_message
             def __getattr__(self, name):
                 return getattr(self.limit, name)

         wrapped = LimitWrapper(limit_item, f"Rate limit exceeded: {limit_string}")
         raise RateLimitExceeded(wrapped)

Limiter.check_for_limits = check_for_limits

# Configure logging for local development
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from ..db.connection_manager import ConnectionManager
from ..supabase_client import create_supabase_client
from ..utils.metrics import metrics_collector
from .middleware.logging_middleware import LoggingMiddleware
from .routes import assessments as assessments_router
from .routes import auth as auth_router
from .routes import profiles as profiles_router
from .routes import questions as questions_router

logger = logging.getLogger(__name__)
from .config import config

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for FastAPI application.
    Handles startup and shutdown logic.
    """
    # --- Startup ---
    logger.info("LifeSync Personality Engine starting up...")
    try:
        manager = ConnectionManager()
        url = config.get_supabase_url()
        key = config.get_supabase_key()
        service_key = os.getenv("SUPABASE_SERVICE_ROLE")

        if not url or not key or "your-project" in url or "your-anon-key" in key:
            logger.warning("Supabase credentials not configured properly.")
        else:
            manager.initialize(url=url, key=key, service_key=service_key)
            logger.info("Database connection pool initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize connection pool: {e}")

    logger.info(f"Server started on {config.API_HOST}:{config.API_PORT}")
    
    yield
    
    # --- Shutdown ---
    logger.info("LifeSync Personality Engine shutting down...")
    try:
        manager = ConnectionManager()
        manager.close()
        logger.info("Database connection pool closed successfully")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")
    logger.info("Shutdown complete")

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="LifeSync Personality Engine API",
    description="API for personality assessment scoring and explanation generation",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter to app state
app.state.limiter = limiter

# Add rate limit exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors"""
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "detail": "Too many requests. Please try again later.",
            "retry_after": exc.detail if hasattr(exc, 'detail') else None
        }
    )

# CORS middleware - Use configured allowed origins
allowed_origins = config.get_allowed_origins()
logger.info(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],  # Fallback to * only if no origins configured
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured Logging Middleware
app.add_middleware(LoggingMiddleware)

# GZip compression middleware (performance optimization)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request Timeout Middleware (Fixes issue #12)
@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    """
    Middleware to enforce global request timeout.

    Returns 408 Request Timeout if processing exceeds configured duration.
    """
    # Get timeout from config, default to 60s
    timeout = getattr(config, "REQUEST_TIMEOUT", 60.0)

    try:
        # Apply timeout to request processing
        return await asyncio.wait_for(call_next(request), timeout=timeout)

    except asyncio.TimeoutError:
        logger.warning(f"Request timed out: {request.method} {request.url.path}")
        return JSONResponse(
            status_code=408,
            content={
                "error": "Request Timeout",
                "detail": f"Request took longer than {timeout} seconds to process"
            }
        )
    except Exception as e:
        # Re-raise other exceptions to be handled by exception handlers
        raise e


# Lifecycle Management (Fixes issue #9)
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for FastAPI application.
    Handles startup and shutdown logic.
    """
    # --- Startup ---
    logger.info("LifeSync Personality Engine starting up...")
    try:
        manager = ConnectionManager()
        url = config.get_supabase_url()
        key = config.get_supabase_key()
        service_key = os.getenv("SUPABASE_SERVICE_ROLE")

        if not url or not key or "your-project" in url or "your-anon-key" in key:
            logger.warning("Supabase credentials not configured properly.")
        else:
            manager.initialize(url=url, key=key, service_key=service_key)
            logger.info("Database connection pool initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize connection pool: {e}")

    logger.info(f"Server started on {config.API_HOST}:{config.API_PORT}")
    
    yield
    
    # --- Shutdown ---
    logger.info("LifeSync Personality Engine shutting down...")
    try:
        manager = ConnectionManager()
        manager.close()
        logger.info("Database connection pool closed successfully")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")
    logger.info("Shutdown complete")


# Include routers
app.include_router(questions_router.router, tags=["questions"])
app.include_router(assessments_router.router, tags=["assessments"])
app.include_router(profiles_router.router, tags=["profiles"])
app.include_router(auth_router.router, prefix="/v1/auth", tags=["auth"])
 # Included assessments router

# Pydantic models for questions endpoint
class QuestionOut(BaseModel):
    id: str
    text: str
    trait: str
    facet: str
    reverse: bool

# Global supabase instance for direct access
try:
    url = config.get_supabase_url()
    key = config.get_supabase_key()
    if url and key and "your-project" not in url and "your-anon-key" not in key:
        supabase = create_supabase_client(url=url, key=key)
    else:
        supabase = None
        logger.warning("Supabase credentials not configured, GET /v1/questions will fail")
except Exception as e:
    logger.error(f"Failed to create global Supabase client: {e}")
    supabase = None


@app.get("/metrics")
def get_metrics():
    """
    Get application performance metrics and cache stats.
    """
    metrics = metrics_collector.get_metrics()
    metrics["cache"] = get_cache_stats()
    metrics["database_initialized"] = ConnectionManager().is_initialized()
    return metrics

@app.get("/health")
def health_check():
    """
    Health check endpoint.

    Returns server status and connection pool health.
    """
    try:
        manager = ConnectionManager()
        pool_initialized = manager.is_initialized()

        return {
            "status": "healthy",
            "service": "LifeSync Personality Engine",
            "version": "1.0.0",
            "database": {
                "connection_pool": "initialized" if pool_initialized else "not_initialized"
            }
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "degraded",
            "service": "LifeSync Personality Engine",
            "version": "1.0.0",
            "error": str(e)
        }


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "service": "LifeSync Personality Engine API",
        "version": "1.0.0",
        "endpoints": {
            "POST /v1/assessments": "Create and score a personality assessment",
            "POST /v1/assessments/{id}/generate_explanation": "Generate LLM explanation for an assessment",
            "GET /health": "Health check"
        }
    }


if __name__ == "__main__":
    import uvicorn
    # Use port from config (which defaults to 8000 or the API_PORT/PORT env var)
    uvicorn.run(app, host=config.API_HOST, port=config.API_PORT)

