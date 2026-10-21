# Antigravity Power Tools - Uninstaller

$ErrorActionPreference = 'SilentlyContinue'
Write-Host "Removing Antigravity Power Tools auto-start..." -ForegroundColor Yellow

# 1. Remove Startup entry
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$vbsPath = "$startupFolder\AntigravityPowerTools.vbs"
if (Test-Path $vbsPath) {
    Remove-Item -Force $vbsPath
    Write-Host "[OK] Removed Windows Startup entry: $vbsPath" -ForegroundColor Green
}

# 2. Stop running daemon process if any
$procs = Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%power_daemon.js%'"
foreach ($p in $procs) {
    Stop-Process -Id $p.ProcessId -Force
    Write-Host "[OK] Stopped Power Tools background process (PID: $($p.ProcessId))" -ForegroundColor Green
}

# 3. Restore Stock GEMINI.md
$geminiPath = "$env:USERPROFILE\.gemini\config\GEMINI.md"
if (Test-Path $geminiPath) {
    $stock = @'
# Global Execution Guidelines

## Windows Terminal & PowerShell Execution
- **Never nest `powershell -Command`**: The terminal shell is already PowerShell. Stacking nested invocations strips inner quotes, causing broken tokens and `SyntaxError: '(' was never closed`.
- **Inline Python execution**:
  - Never generate throwaway `.py` test files (`verify_*.py`, `temp_test.py`) for simple one-off checks.
  - For inline execution, pipe a PowerShell heredoc into Python:
    ```powershell
    @'
    import module
    # test code
    '@ | python
    ```
  - Or run modules/test runners directly: `python -m <module>` or `pytest`.
- **Network calls**: Always include explicit timeouts and try/catch around external network requests to prevent unhandled hang or `getaddrinfo failed` crashes.

# Active Operational Doctrine: STOCK DEFAULT

Standard Senior Full-Stack Architect.
'@
    Set-Content -Path $geminiPath -Value $stock -Encoding UTF8
    Write-Host "[OK] Restored GEMINI.md to default stock directives." -ForegroundColor Green
}

Write-Host ""
Write-Host "Antigravity Power Tools uninstalled successfully." -ForegroundColor Cyan
