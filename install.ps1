# Antigravity Power Tools - Automated Installer
# Ensures the Power Tools daemon starts silently whenever Antigravity / Windows runs.

$ErrorActionPreference = 'Stop'
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ANTIGRAVITY POWER TOOLS - INSTALLER (v4.0 Native)      " -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Node.js prerequisite
try {
    $nodeVer = & node -v
    Write-Host "[OK] Node.js runtime detected: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[!] Error: Node.js is required but was not found in PATH." -ForegroundColor Red
    Write-Host "    Please install Node.js (https://nodejs.org) and re-run." -ForegroundColor Yellow
    exit 1
}

# 2. Setup Target Installation Directories
$baseConfigDir = "$env:USERPROFILE\.gemini\config"
$targetToolsDir = "$baseConfigDir\power-tools"
$targetSkillsDir = "$baseConfigDir\skills"
$scriptRoot = $PSScriptRoot

if (-not (Test-Path $targetToolsDir)) {
    New-Item -ItemType Directory -Force -Path $targetToolsDir | Out-Null
}
if (-not (Test-Path $targetSkillsDir)) {
    New-Item -ItemType Directory -Force -Path $targetSkillsDir | Out-Null
}

Write-Host "[+] Synchronizing Power Tools runtime files to: $targetToolsDir" -ForegroundColor Cyan
Copy-Item -Force "$scriptRoot\bin\power_daemon.js" "$targetToolsDir\"
Copy-Item -Force "$scriptRoot\bin\studio_ui.js" "$targetToolsDir\"

# 3. Synchronize Skills / Doctrines
if (Test-Path "$scriptRoot\skills") {
    Write-Host "[+] Synchronizing Cognitive Engine skills to: $targetSkillsDir" -ForegroundColor Cyan
    $skills = Get-ChildItem "$scriptRoot\skills" -Directory
    foreach ($sk in $skills) {
        $dest = "$targetSkillsDir\$($sk.Name)"
        if (-not (Test-Path $dest)) {
            New-Item -ItemType Directory -Force -Path $dest | Out-Null
        }
        Copy-Item -Recurse -Force "$($sk.FullName)\*" "$dest\"
    }
}

# 4. Register Silent Windows Startup Hook
# Every time Windows boots or user logs in, daemon starts invisibly with zero console flash.
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$vbsPath = "$startupFolder\AntigravityPowerTools.vbs"

$vbsContent = @'
Set WshShell = CreateObject("WScript.Shell")
strDaemon = WshShell.ExpandEnvironmentStrings("%USERPROFILE%\.gemini\config\power-tools\power_daemon.js")
WshShell.Run "node """ & strDaemon & """", 0, False
'@

Set-Content -Path $vbsPath -Value $vbsContent -Encoding ASCII
Write-Host "[OK] Registered silent auto-start entry in Windows Startup folder:" -ForegroundColor Green
Write-Host "     $vbsPath" -ForegroundColor Gray

# 5. Check if Daemon is currently running; if not, launch it now
$daemonRunning = $false
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:55979/get-state" -TimeoutSec 1 -ErrorAction SilentlyContinue
    if ($resp) { $daemonRunning = $true }
} catch {}

if ($daemonRunning) {
    Write-Host "[OK] Power Tools daemon is already active on http://127.0.0.1:55979." -ForegroundColor Green
} else {
    Write-Host "[+] Launching Power Tools background daemon..." -ForegroundColor Cyan
    Start-Process -FilePath "wscript.exe" -ArgumentList "`"$vbsPath`"" -WindowStyle Hidden
    Start-Sleep -Seconds 2
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:55979/get-state" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($resp) {
            Write-Host "[OK] Power Tools daemon successfully launched and listening!" -ForegroundColor Green
        }
    } catch {
        Write-Host "[!] Note: Daemon launched in background; will automatically connect once Antigravity is open." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   INSTALLATION COMPLETE: ANTIGRAVITY IS SUPERCHARGED!    " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " [x] Auto-Launch: Whenever Antigravity opens, Power Tools injects automatically." -ForegroundColor White
Write-Host " [x] Sidebar: Click 'Power Tools' next to Automations to open the control suite." -ForegroundColor White
Write-Host " [x] Chat Footer: Instant token counter & cognitive engine switcher." -ForegroundColor White
Write-Host " [x] Turn Shower: Minimalist SVG turn breadcrumbs under each prompt." -ForegroundColor White
Write-Host ""
