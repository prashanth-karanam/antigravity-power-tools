@echo off
title Antigravity Power Tools Installer
echo [Antigravity Power Tools] Launching installer...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Installer exited with code %ERRORLEVEL%.
    pause
) else (
    echo.
    echo Press any key to exit.
    pause >nul
)
