@echo off
echo Starting Network Traffic Monitor Setup...
echo.

:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrative privileges...
) else (
    echo Please run this script as Administrator
    echo Right-click on setup.bat and select "Run as administrator"
    pause
    exit /b 1
)

:: Create temp directory if it doesn't exist
if not exist "%temp%\network_monitor_setup" mkdir "%temp%\network_monitor_setup"

:: Check if Node.js is installed
where node >nul 2>&1
if %errorLevel% == 0 (
    echo Node.js is installed...
) else (
    echo Node.js is not installed. Downloading Node.js installer...
    
    :: Download Node.js installer using PowerShell
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%temp%\network_monitor_setup\nodejs_installer.msi'}"
    
    if %errorLevel% == 0 (
        echo Installing Node.js...
        :: Run the installer silently
        msiexec /i "%temp%\network_monitor_setup\nodejs_installer.msi" /qn
        
        if %errorLevel% == 0 (
            echo Node.js installed successfully.
            :: Refresh environment variables
            call refreshenv.cmd
            if %errorLevel% == 1 (
                :: If refreshenv is not available, prompt for restart
                echo Please restart your computer to complete Node.js installation
                echo After restarting, run setup.bat again.
                pause
                exit /b 1
            )
        ) else (
            echo Failed to install Node.js.
            echo Please download and install Node.js manually from https://nodejs.org/
            start https://nodejs.org/
            pause
            exit /b 1
        )
    ) else (
        echo Failed to download Node.js installer.
        echo Please check your internet connection or download Node.js manually from https://nodejs.org/
        start https://nodejs.org/
        pause
        exit /b 1
    )
)

:: Check PowerShell execution policy
echo Checking PowerShell execution policy...
powershell -Command "Get-ExecutionPolicy" | findstr /i "Restricted" >nul
if %errorLevel% == 0 (
    echo Updating PowerShell execution policy...
    powershell -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
    if %errorLevel% == 0 (
        echo PowerShell execution policy updated successfully.
    ) else (
        echo Failed to update PowerShell execution policy.
        echo Please run PowerShell as Administrator and execute:
        echo Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        pause
        exit /b 1
    )
)

:: Install dependencies
echo Installing Node.js dependencies...
call npm install
if %errorLevel% == 0 (
    echo Dependencies installed successfully.
) else (
    echo Failed to install dependencies.
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

:: Clean up temp files
if exist "%temp%\network_monitor_setup" rmdir /s /q "%temp%\network_monitor_setup"

:: Create a flag file to indicate setup is complete
echo Setup completed successfully > setup_complete.flag

echo.
echo Setup completed successfully!
echo You can now run start.bat to launch the application.
echo.
pause
