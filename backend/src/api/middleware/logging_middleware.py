"""
Logging Middleware for Observability
Logs request/response details in structured JSON format with Request-ID tracking.
"""

import json
import logging
import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from ...utils.metrics import metrics_collector

logger = logging.getLogger("lifesync.access")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Generate or retrieve a unique correlation ID for the request
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start_time = time.time()

        # Prepare context
        path = request.url.path
        method = request.method
        client_host = request.client.host if request.client else "unknown"
        
        # Attach request_id to request state for use in routes
        request.state.request_id = request_id

        try:
            response = await call_next(request)

            process_time = (time.time() - start_time) * 1000
            status_code = response.status_code

            # Update metrics
            metrics_collector.record_request(process_time, status_code >= 400)

            log_data = {
                "timestamp": time.time(),
                "request_id": request_id,
                "method": method,
                "path": path,
                "status_code": status_code,
                "duration_ms": round(process_time, 2),
                "client_ip": client_host
            }

            # Use appropriate log level based on status code
            if status_code >= 500:
                logger.error(json.dumps(log_data))
            elif status_code >= 400:
                logger.warning(json.dumps(log_data))
            else:
                logger.info(json.dumps(log_data))
                
            # Add correlation ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            process_time = (time.time() - start_time) * 1000

            # Update metrics
            metrics_collector.record_request(process_time, True)

            log_data = {
                "timestamp": time.time(),
                "request_id": request_id,
                "method": method,
                "path": path,
                "status_code": 500,
                "duration_ms": round(process_time, 2),
                "client_ip": client_host,
                "error": str(e)
            }
            logger.error(json.dumps(log_data))
            raise e
