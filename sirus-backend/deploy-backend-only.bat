@echo off
echo ========================================
echo SIRUS Backend - Quick Deployment
echo ========================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Load environment variables
if exist .env (
    echo Loading environment variables from .env file...
    for /f "tokens=1,2 delims==" %%a in (.env) do set %%a=%%b
) else (
    echo WARNING: .env file not found. Using default values.
)

REM Set default values if not in .env
if not defined CONTAINER_NAME set CONTAINER_NAME=sirus-backend
if not defined IMAGE_NAME set IMAGE_NAME=sirus-backend:latest
if not defined PORT set PORT=8080

echo.
echo Configuration:
echo - Container Name: %CONTAINER_NAME%
echo - Image Name: %IMAGE_NAME%
echo - Port: %PORT%
echo.

REM Build Docker image
echo Building Docker image...
docker build -t %IMAGE_NAME% .
if %errorlevel% neq 0 (
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)

REM Stop and remove existing container if it exists
echo Stopping existing container if running...
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1

REM Run the container
echo Starting container...
docker run -d ^
    --name %CONTAINER_NAME% ^
    -p %PORT%:8080 ^
    --env-file .env ^
    %IMAGE_NAME%

if %errorlevel% neq 0 (
    echo ERROR: Failed to start container!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Container successfully started!
echo ========================================
echo.
echo Container details:
echo - Name: %CONTAINER_NAME%
echo - Port: %PORT%
echo - Status: Running
echo.
echo To view logs: docker logs %CONTAINER_NAME%
echo To stop container: docker stop %CONTAINER_NAME%
echo To remove container: docker rm %CONTAINER_NAME%
echo.
echo Application should be available at: http://localhost:%PORT%
echo.
pause 