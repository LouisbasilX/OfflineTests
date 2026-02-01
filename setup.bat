@echo off
setlocal
title OfflineTests Project Generator

echo ===================================================
echo   OfflineTests: MVP Folder Structure Generator
echo ===================================================
echo.

if not exist "structure.json" (
    echo [ERROR] structure.json not found!
    echo Please save the JSON code into a file named 'structure.json'
    pause
    exit /b
)

echo Reading structure.json...
echo.

:: This hybrid script calls PowerShell to parse JSON and create files
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$json = Get-Content 'structure.json' -Raw | ConvertFrom-Json;" ^
    "function Create-Tree($obj, $path) {" ^
    "    foreach ($prop in $obj.PSObject.Properties) {" ^
    "        $currentPath = Join-Path $path $prop.Name;" ^
    "        if ($prop.Value -is [System.Management.Automation.PSCustomObject]) {" ^
    "            if (-not (Test-Path $currentPath)) { New-Item -ItemType Directory -Path $currentPath -Force | Out-Null; Write-Host '  [DIR]  ' $currentPath -ForegroundColor Cyan }" ^
    "            Create-Tree $prop.Value $currentPath;" ^
    "        } else {" ^
    "            if (-not (Test-Path $currentPath)) { New-Item -ItemType File -Path $currentPath -Force | Out-Null; Write-Host '  [FILE] ' $currentPath -ForegroundColor Green }" ^
    "        }" ^
    "    }" ^
    "}" ^
    "Create-Tree $json '.'"

echo.
echo ===================================================
echo   SUCCESS! Project structure created.
echo ===================================================
pause