#!/usr/bin/env pwsh

# Deploy script for FuelTracker
# Usage: .\deploy.ps1 <version> <message>
# Example: .\deploy.ps1 "1.7" "Fix mobile issues and add new features"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,

    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Set error action preference
$ErrorActionPreference = "Stop"

$separator = "=" * 40
Write-Host $separator -ForegroundColor Cyan
Write-Host "FuelTracker Deploy Script" -ForegroundColor Cyan
Write-Host $separator -ForegroundColor Cyan
Write-Host ""

# Check if version.ts exists
$versionFile = "src\lib\version.ts"
if (-not (Test-Path $versionFile)) {
    Write-Host "Error: $versionFile not found!" -ForegroundColor Red
    exit 1
}

# Update version in version.ts
Write-Host "Updating version to $Version..." -ForegroundColor Yellow
$nextVersion = [double]$Version + 0.1
$nextVersionStr = $nextVersion.ToString("0.0")

$content = @"
export const APP_VERSION = "$Version";
export const APP_NAME = "FuelTracker";
export const NEXT_VERSION = "$nextVersionStr";
"@

Set-Content -Path $versionFile -Value $content -NoNewline
Write-Host "✓ Version updated to $Version (next: $nextVersionStr)" -ForegroundColor Green
Write-Host ""

# Run build
Write-Host "Running build..." -ForegroundColor Yellow
$buildResult = pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful!" -ForegroundColor Green
Write-Host ""

# Git add all changes
Write-Host "Staging changes..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Git add failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Changes staged" -ForegroundColor Green
Write-Host ""

# Git commit
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = "Version $Version : $Message"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Git commit failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Committed: $commitMessage" -ForegroundColor Green
Write-Host ""

# Git push
Write-Host "Pushing to remote..." -ForegroundColor Yellow
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Git push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Pushed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host $separator -ForegroundColor Cyan
Write-Host "Deploy completed successfully!" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Cyan
Write-Host $separator -ForegroundColor Cyan
