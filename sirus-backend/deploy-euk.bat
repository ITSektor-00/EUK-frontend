@echo off
echo ========================================
echo EUK Backend Deployment
echo ========================================
echo.

echo Proveravam Java verziju...
java -version
if %errorlevel% neq 0 (
    echo GRESKA: Java nije instaliran ili nije u PATH-u
    pause
    exit /b 1
)

echo.
echo Ciscim i build-ujem projekat...
call mvnw clean package -DskipTests
if %errorlevel% neq 0 (
    echo GRESKA: Build neuspesan
    pause
    exit /b 1
)

echo.
echo ========================================
echo EUK Backend je uspesno build-ovan!
echo ========================================
echo.
echo Konfiguracija za EUK domene:
echo - https://euk.vercel.app
echo - https://euk-it-sectors-projects.vercel.app
echo.
echo Rate limiting: 150 zahteva/min za EUK domene
echo CORS: Konfigurisan za EUK domene
echo Security headers: Aktivni
echo.
echo Za pokretanje aplikacije:
echo java -jar target/sirus-backend-0.0.1-SNAPSHOT.jar
echo.
echo Ili sa environment varijablama:
echo set SPRING_PROFILES_ACTIVE=prod
echo set EUK_ALLOWED_DOMAINS=https://euk.vercel.app,https://euk-it-sectors-projects.vercel.app
echo java -jar target/sirus-backend-0.0.1-SNAPSHOT.jar
echo.
pause 