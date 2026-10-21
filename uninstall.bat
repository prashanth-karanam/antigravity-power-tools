@echo off
title Antigravity Power Tools Uninstaller
echo [Antigravity Power Tools] Launching uninstaller...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"
echo.
pause
