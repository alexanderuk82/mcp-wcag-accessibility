@echo off
setlocal enabledelayedexpansion

REM MCP WCAG Installation Script for Windows
REM This script automates the installation process

echo ======================================================
echo 🚀 MCP WCAG Accessibility Tool - Windows Installation
echo ======================================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% installed

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Build project
echo.
echo Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Project built successfully

REM Verify installation
echo.
echo Verifying installation...
call npm run verify
if %errorlevel% neq 0 (
    echo ❌ Verification failed
    pause
    exit /b 1
)
echo ✅ Installation verified

REM Configure Claude Desktop
echo.
echo ======================================================
echo CLAUDE DESKTOP CONFIGURATION
echo ======================================================
echo.

REM Get current directory
set CURRENT_DIR=%CD%
set CONFIG_PATH=%APPDATA%\Claude\claude_desktop_config.json

echo Config location: %CONFIG_PATH%
echo Project location: %CURRENT_DIR%
echo.

REM Create config directory if it doesn't exist
if not exist "%APPDATA%\Claude" (
    mkdir "%APPDATA%\Claude"
)

REM Ask user if they want automatic configuration
set /p CONFIGURE="Would you like to configure Claude Desktop automatically? (y/n): "
if /i "%CONFIGURE%"=="y" (
    echo Creating Claude Desktop configuration...
    
    REM Backup existing config if it exists
    if exist "%CONFIG_PATH%" (
        copy "%CONFIG_PATH%" "%CONFIG_PATH%.backup" >nul
        echo Backup saved to: %CONFIG_PATH%.backup
    )
    
    REM Create new config
    (
        echo {
        echo   "mcpServers": {
        echo     "wcag-accessibility": {
        echo       "command": "node",
        echo       "args": ["%CURRENT_DIR:\=\\%\\dist\\index.js"]
        echo     }
        echo   }
        echo }
    ) > "%CONFIG_PATH%"
    
    echo ✅ Claude Desktop configured successfully
) else (
    echo.
    echo Manual configuration needed. Add this to your Claude config:
    echo Location: %CONFIG_PATH%
    echo.
    echo {
    echo   "mcpServers": {
    echo     "wcag-accessibility": {
    echo       "command": "node",
    echo       "args": ["%CURRENT_DIR:\=\\%\\dist\\index.js"]
    echo     }
    echo   }
    echo }
)

echo.
echo ======================================================
echo 🎉 INSTALLATION COMPLETE!
echo ======================================================
echo.
echo Next steps:
echo   1. Restart Claude Desktop
echo   2. Test with: "Analyze this HTML for accessibility: <img src='test.jpg'>"
echo.
echo Available tools:
echo   - analyze_accessibility
echo   - refactor_for_wcag
echo   - validate_compliance
echo   - get_documentation
echo   - annotate_code
echo   - accessibility_score
echo   - generate_component
echo   - eslint_config
echo   - live_url_audit
echo   - wcag_github_sync
echo.
echo Press any key to exit...
pause >nul
