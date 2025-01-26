@echo off
echo Starting Network Traffic Monitor...

:: Check if setup is complete
if not exist "setup_complete.flag" (
    echo Setup has not been run yet.
    echo Running setup first...
    call setup.bat
    if errorlevel 1 (
        echo Setup failed. Please fix the errors and try again.
        pause
        exit /b 1
    )
)

:: Start the application
start "" http://localhost:3000
npm start
