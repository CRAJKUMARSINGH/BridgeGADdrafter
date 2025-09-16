@echo off
echo ========================================
echo    BRIDGE GAD BridgeGAD-09 - ONE CLICK START    
echo ========================================
echo.
echo Professional Bridge Design & Drawing Generation System
echo Author: Rajkumar Singh Chauhan
echo Email: crajkumarsingh@hotmail.com
echo.

REM Create folders if needed
if not exist "OUTPUT_01_16092025" mkdir OUTPUT_01_16092025

echo Starting application...
if exist streamlit_app.py (
    streamlit run streamlit_app.py --server.port 8501
) else if exist app.py (
    streamlit run app.py --server.port 8501
) else if exist main.py (
    python main.py
) else (
    echo No main application file found
    pause
)
