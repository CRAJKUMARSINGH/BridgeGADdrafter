@echo off
REM ===================================================================
REM ONE-CLICK START FOR BRIDGEGAD APPLICATIONS
REM Professional Bridge Design & Drawing Generation
REM ===================================================================
REM Author: Rajkumar Singh Chauhan
REM Email: crajkumarsingh@hotmail.com
REM ===================================================================

setlocal enabledelayedexpansion
color 0A

echo.
echo ========================================================
echo         BRIDGEGAD APPLICATION - ONE CLICK START        
echo ========================================================
echo  Professional Bridge Design & Drawing Generation
echo  Author: Rajkumar Singh Chauhan
echo  Email: crajkumarsingh@hotmail.com
echo ========================================================
echo.

REM Get current directory
set "APP_DIR=%~dp0"
set "APP_NAME=%~n0"

echo [INFO] Application Directory: %APP_DIR%
echo [INFO] Starting BridgeGAD Application...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo [INFO] Please install Python from https://python.org
    echo [INFO] Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [SUCCESS] Python installation found
python --version

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo [INFO] Virtual environment found, activating...
    call venv\Scripts\activate.bat
    echo [SUCCESS] Virtual environment activated
) else (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created
    echo [INFO] Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Install/Update requirements
if exist "requirements.txt" (
    echo [INFO] Installing/updating requirements...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [WARNING] Some packages may have failed to install
        echo [INFO] Continuing anyway...
    ) else (
        echo [SUCCESS] All requirements installed successfully
    )
) else (
    echo [INFO] No requirements.txt found, installing basic packages...
    pip install streamlit pandas numpy openpyxl ezdxf PyYAML
)

echo.
echo ========================================================
echo              LAUNCHING APPLICATION...                  
echo ========================================================
echo.

REM Try different main application files
if exist "app.py" (
    echo [INFO] Launching app.py...
    streamlit run app.py
) else if exist "main.py" (
    echo [INFO] Launching main.py...
    python main.py
) else if exist "rajkumar_app.py" (
    echo [INFO] Launching rajkumar_app.py...
    streamlit run rajkumar_app.py
) else if exist "bridge_gad.py" (
    echo [INFO] Launching bridge_gad.py...
    python bridge_gad.py
) else if exist "enhanced_bridge_app.py" (
    echo [INFO] Launching enhanced_bridge_app.py...
    streamlit run enhanced_bridge_app.py
) else (
    echo [ERROR] No main application file found
    echo [INFO] Looking for Python files...
    dir *.py /b
    echo.
    echo [INFO] Please ensure one of these files exists:
    echo   - app.py (for Streamlit apps)
    echo   - main.py (for general Python apps)
    echo   - rajkumar_app.py (for custom Streamlit apps)
    echo   - bridge_gad.py (for bridge-specific apps)
    echo   - enhanced_bridge_app.py (for enhanced apps)
    pause
    exit /b 1
)

echo.
echo [INFO] Application has finished running
echo [INFO] Thank you for using BridgeGAD!
echo.
pause