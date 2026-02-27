"""
Structured Logging Middleware for LifeSync
Provides JSON-formatted logs for all incoming requests.
"""

import time
import json
import logging
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger("lifesync.access")

class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs detail of every request/response in JSON format.
    """
    
    async def dispatch(self, request: Request, call_next):
        # Generate a unique correlation ID for the request
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        
        # Store start time
        start_time = time.time()
        
        # Prepare request details
        request_details = {
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
        }
        
        # Attach request_id to request state for use in routes
        request.state.request_id = request_id
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Prepare log record
            log_record = {
                **request_details,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
                "level": "INFO" if response.status_code < 400 else "WARNING"
            }
            
            # Add correlation ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            # Log structured data
            logger.info(json.dumps(log_record))
            
            return response
            
        except Exception as e:
            # Log exceptions
            duration = time.time() - start_time
            log_record = {
                **request_details,
                "error": str(e),
                "duration_ms": round(duration * 1000, 2),
                "level": "ERROR"
            }
            logger.error(json.dumps(log_record))
            raise
