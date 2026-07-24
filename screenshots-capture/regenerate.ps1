<#
.SYNOPSIS
  Regenerate the AskUI Desktop UI screenshots used by the docs site.

.DESCRIPTION
  Drives the AskUI Desktop app via the AskUI CLI (from the sibling
  integrated-task-plattform checkout) and saves screenshots into
  ../public/screenshots via the project's save_screenshot custom tool.

  Prerequisites:
    * The AskUI Desktop app is running, signed in, and visible on display 1.
    * screenshots-capture/.env contains ASKUI_WORKSPACE_ID + ASKUI_TOKEN
      (copy .env.example). The CLI loads it automatically.
    * The sibling integrated-task-plattform repo is checked out (the CLI is not
      shipped standalone yet).

.EXAMPLE
  pwsh screenshots-capture/regenerate.ps1
  pwsh screenshots-capture/regenerate.ps1 -Target tests/capture_desktop_ui.md
#>
[CmdletBinding()]
param(
    # Path to the integrated-task-plattform checkout that holds AskUI.Cli.
    # Relative paths are resolved against this script's folder. Defaults to the
    # sibling checkout next to docs-rewrite.
    [string]$AppRepo = '..\..\integrated-task-plattform',
    # Test file or folder under this project to run.
    [string]$Target  = "tests/capture_desktop_ui.md"
)

$ErrorActionPreference = 'Stop'

# Normalise to a clean absolute path - Test-Path/Join-Path choke on unresolved
# '..' segments (PSArgumentException: "outside the base 'C:'").
if (-not [System.IO.Path]::IsPathRooted($AppRepo)) {
    $AppRepo = Join-Path $PSScriptRoot $AppRepo
}
$AppRepo = [System.IO.Path]::GetFullPath($AppRepo)

$projectRoot = (Resolve-Path $PSScriptRoot).Path
$docsRoot    = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cliProject  = Join-Path $AppRepo 'src\AskUI.Cli'

if (-not (Test-Path $cliProject)) {
    throw "AskUI.Cli not found at '$cliProject'. Pass -AppRepo <path-to-integrated-task-plattform>."
}

# Output folder that save_screenshot writes into - the docs static asset dir.
$screenshotsDir = Join-Path $docsRoot 'public/screenshots'
New-Item -ItemType Directory -Force -Path $screenshotsDir | Out-Null
$env:DOCS_SCREENSHOTS_DIR = $screenshotsDir

# The integrated-task-plattform repo pins its SDK via global.json to a version
# that lives under %LOCALAPPDATA%\Microsoft\dotnet; the PATH dotnet may not have it.
$dotnet = Join-Path $env:LOCALAPPDATA 'Microsoft/dotnet/dotnet.exe'
if (-not (Test-Path $dotnet)) { $dotnet = 'dotnet' }

if (-not (Get-Process -Name 'AskUI.Desktop.Windows' -ErrorAction SilentlyContinue)) {
    Write-Host "Note: AskUI Desktop is not running yet - the capture flow will open it from the Start menu. Ensure it is installed and a user is signed in on this machine." -ForegroundColor Yellow
}

Write-Host "Capturing '$Target' -> $screenshotsDir" -ForegroundColor Cyan
& $dotnet run --project $cliProject -- run $Target --project-root $projectRoot
$exit = $LASTEXITCODE

Write-Host ""
if ($exit -eq 0) {
    Write-Host "Done. Review the new PNGs in public/screenshots/ and run 'npm run dev' to preview." -ForegroundColor Green
} else {
    Write-Warning "CLI exited with code $exit. Check the run report under screenshots-capture/agent_workspace/ for details."
}
exit $exit
