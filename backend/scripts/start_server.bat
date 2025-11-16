@echo off
REM LifeSync Personality Engine - Server Startup Script
echo Starting LifeSync Personality Engine API server...
echo.
echo Server will run on: http://localhost:5174
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn src.api.server:app --reload --port 5174

