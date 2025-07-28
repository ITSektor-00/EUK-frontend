@echo off
echo ========================================
echo SIRUS Backend Deployment with PostgreSQL
echo ========================================

REM Load environment variables
if exist .env (
    echo Loading .env file...
    for /f "tokens=*" %%a in (.env) do set %%a
)

REM Check if required variables are set
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL not set in .env file
    pause
    exit /b 1
)

if "%DATABASE_USERNAME%"=="" (
    echo ERROR: DATABASE_USERNAME not set in .env file
    pause
    exit /b 1
)

if "%DATABASE_PASSWORD%"=="" (
    echo ERROR: DATABASE_PASSWORD not set in .env file
    pause
    exit /b 1
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

echo.
echo Building Docker image...
docker build -t %IMAGE_NAME% .

if %errorlevel% neq 0 (
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)

echo.
echo Stopping existing container if running...
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1

echo.
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
echo Deployment completed successfully!
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