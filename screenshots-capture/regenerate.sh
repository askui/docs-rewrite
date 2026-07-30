#!/usr/bin/env bash
# Regenerate the AskUI Desktop UI screenshots used by the docs site — macOS/Linux
# driver (the Windows counterpart is regenerate.ps1).
#
# Drives the AskUI Desktop app via the AskUI CLI (from the sibling
# integrated-task-plattform checkout) and saves screenshots into
# ../public/screenshots via the project's save_screenshot custom tool.
#
# Prerequisites:
#   * The AskUI Desktop app is installed, signed in, and visible on display 1
#     (the capture flow opens it via Spotlight if it is not running).
#   * screenshots-capture/.env contains ASKUI_WORKSPACE_ID + ASKUI_TOKEN
#     (copy .env.example). The CLI loads it automatically.
#   * The sibling integrated-task-plattform repo is checked out (the CLI is
#     not shipped standalone yet).
#   * macOS: the AskUI controller has Screen Recording permission
#     (System Settings → Privacy & Security → Screen Recording). Granted once,
#     it sticks per controller binary.
#
# Usage:
#   ./screenshots-capture/regenerate.sh
#   ./screenshots-capture/regenerate.sh tests/capture_desktop_ui.md
#   APP_REPO=/path/to/integrated-task-plattform ./screenshots-capture/regenerate.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET="${1:-tests/capture_desktop_ui.md}"

# Locate the app repo (holds AskUI.Cli): $APP_REPO wins, then the known
# checkout layouts next to this repo.
CANDIDATES=(
    "${APP_REPO:-}"
    "$DOCS_ROOT/../integrated-task-plattform"
    "$DOCS_ROOT/../../2-DesktopApp/main"
    "$DOCS_ROOT/../integrated-task-platform"
)
APP_REPO=""
for c in "${CANDIDATES[@]}"; do
    [[ -n "$c" && -d "$c/src/AskUI.Cli" ]] && { APP_REPO="$(cd "$c" && pwd)"; break; }
done
if [[ -z "$APP_REPO" ]]; then
    echo "AskUI.Cli not found. Probed:" >&2
    printf '  %s\n' "${CANDIDATES[@]:1}" >&2
    echo "Set APP_REPO=<path-to-the-app-repo-checkout>." >&2
    exit 2
fi
CLI_PROJECT="$APP_REPO/src/AskUI.Cli"

# Output folder that save_screenshot writes into — the docs static asset dir.
export DOCS_SCREENSHOTS_DIR="$DOCS_ROOT/public/screenshots"
mkdir -p "$DOCS_SCREENSHOTS_DIR"

# The SDK auto-starts the local controller. If none is configured, fall back
# to the controller the desktop app installed (macOS).
CONTROLLER_FALLBACK="$HOME/Library/Application Support/AskUIDesktop/py-env/lib/python3.12/site-packages/askui_agent_os/bin/AskuiRemoteDeviceController"
if [[ -z "${ASKUI_CONTROLLER_PATH:-}" && -x "$CONTROLLER_FALLBACK" ]]; then
    export ASKUI_CONTROLLER_PATH="$CONTROLLER_FALLBACK"
fi

if ! pgrep -q "AskUI.Desktop" 2>/dev/null; then
    echo "Note: AskUI Desktop is not running yet — the capture flow will open it. Ensure it is installed and a user is signed in on this machine."
fi

echo "Capturing '$TARGET' -> $DOCS_SCREENSHOTS_DIR"
dotnet run --project "$CLI_PROJECT" -- run "$TARGET" --project-root "$SCRIPT_DIR"
EXIT=$?

echo
if [[ $EXIT -eq 0 ]]; then
    echo "Done. Review the new PNGs in public/screenshots/ and run 'npm run dev' to preview."
else
    echo "CLI exited with code $EXIT. Check the run report under screenshots-capture/agent_workspace/ for details." >&2
fi
exit $EXIT
