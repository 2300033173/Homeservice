@echo off
echo ========================================
echo    HouseMate Platform Setup Script
echo ========================================
echo.

echo 🏠 Setting up HouseMate - Home Services Platform for Vijayawada
echo.

echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo 🔧 Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo ⚛️ Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo 📋 Creating environment file...
if not exist "server\.env" (
    copy "server\.env.example" "server\.env"
    echo ✅ Created server/.env file
    echo ⚠️  Please update the environment variables in server/.env
) else (
    echo ℹ️  Environment file already exists
)

echo.
echo 📁 Creating upload directories...
if not exist "server\uploads" mkdir "server\uploads"
if not exist "server\uploads\reviews" mkdir "server\uploads\reviews"
echo ✅ Created upload directories

echo.
echo ========================================
echo    Setup Complete! 🎉
echo ========================================
echo.
echo 📝 Next Steps:
echo 1. Update database credentials in server/.env
echo 2. Set up PostgreSQL database
echo 3. Run 'npm run dev' to start both servers
echo 4. Run 'npm run seed' in server folder to add sample data
echo.
echo 🌐 The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
echo 🏠 Serving Vijayawada, Andhra Pradesh with ❤️
echo.
pause