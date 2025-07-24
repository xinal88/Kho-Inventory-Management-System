@echo off
echo ========================================
echo   Inventory Management Dashboard Setup
echo ========================================
echo.

echo Step 1: Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed successfully!
echo.

echo Step 2: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed successfully!
echo.

echo Step 3: Setting up environment files...
if not exist .env (
    copy .env.example .env
    echo ✓ Backend .env file created
) else (
    echo ✓ Backend .env file already exists
)

cd ..
if not exist .env (
    copy .env.example .env
    echo ✓ Frontend .env file created
) else (
    echo ✓ Frontend .env file already exists
)
echo.

echo Step 4: Creating admin user and seeding data...
cd backend
call npm run create-admin
if %errorlevel% neq 0 (
    echo Warning: Could not create admin user. This might be due to MongoDB connection.
    echo Please check your MongoDB Atlas setup.
)

call npm run seed
if %errorlevel% neq 0 (
    echo Warning: Could not seed data. This might be due to MongoDB connection.
    echo Please check your MongoDB Atlas setup.
)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Open terminal 1 and run: cd backend && npm run dev
echo 2. Open terminal 2 and run: npm start
echo.
echo Login credentials:
echo Email: admin@inventory.com
echo Password: admin123
echo.
echo MongoDB Atlas connection configured for:
echo Username: dangquybui88
echo.
pause
