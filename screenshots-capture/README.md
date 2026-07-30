# Desktop UI screenshot capture

Reproducible screenshots of the **AskUI Desktop** app for the docs site. Instead
of pasting screenshots in by hand, an AskUI agent drives the app to each screen
and saves a named PNG into [`../public/screenshots/`](../public/screenshots),
which the MDX pages embed.

This is a normal AskUI operator project (`tests/`, `utils/`) run by
the AskUI CLI. The agent captures the app's *own* UI (Runs, Dashboard, Devices,
…) as real screenshots — complementing the hand-built CSS mocks elsewhere in the
docs.

## Layout

```
screenshots-capture/
  tests/
    setup.md                # opens AskUI Desktop from the Start menu + scopes the window
    capture_desktop_ui.md   # the capture flow — one step per screen
    rules.md                # navigate-and-capture rules (do no harm)
  utils/
    format.md               # keep the run report short
    custom_tools/
      save_screenshot.cs    # save_screenshot[name] -> ../public/screenshots/<name>.png
  regenerate.ps1            # Windows driver: runs the CLI, points output at public/screenshots
  regenerate.sh             # macOS/Linux driver (same flow; falls back to the app-installed controller)
  .env.example             # ASKUI_WORKSPACE_ID / ASKUI_TOKEN
```

## Prerequisites

1. **AskUI Desktop installed** (Windows: Programs → `C:\Program Files\AskUI Desktop`;
   macOS: `/Applications/AskUI Desktop.app`) with a user **signed in** on this
   machine. The capture flow opens the app itself (Start menu / Spotlight), so it
   need not already be running — but it operates on **display 1**, so keep that
   display available.
2. **Sibling `integrated-task-plattform` checkout** next to this repo — it holds
   `AskUI.Cli` (not shipped standalone yet). Override its location with
   `-AppRepo` (Windows) / `APP_REPO=` (macOS) if it lives elsewhere.
3. **Credentials**: `cp screenshots-capture/.env.example screenshots-capture/.env`
   and fill in your AskUI workspace id + token (or run under `op run`).
4. **macOS only**: the AskUI controller needs **Screen Recording** permission
   (System Settings → Privacy & Security). The driver falls back to the
   controller the desktop app installed; set `ASKUI_CONTROLLER_PATH` to use a
   different one.

## Run

From the docs-rewrite repo root:

```bash
npm run screenshots
```

or directly:

```powershell
# Windows
powershell -NoProfile -ExecutionPolicy Bypass -File screenshots-capture/regenerate.ps1
```

```bash
# macOS / Linux
./screenshots-capture/regenerate.sh
```

The wrapper sets `DOCS_SCREENSHOTS_DIR` to `../public/screenshots` (absolute),
warns if the Desktop app isn't running, and invokes:

```
dotnet run --project <AppRepo>/src/AskUI.Cli -- run tests/capture_desktop_ui.md --project-root screenshots-capture
```

Each `save_screenshot[<name>]` overwrites `public/screenshots/<name>.png`, so
re-running refreshes every image in place. Review the diff, then
`npm run dev` to preview.

## Adding a new screenshot

1. Add a numbered step to [`tests/capture_desktop_ui.md`](tests/capture_desktop_ui.md):
   "Open the **X** page … call `save_screenshot[desktop-x]`."
2. `npm run screenshots`.
3. Embed it in the MDX page (respect the Pages base path):

   ```jsx
   <img src="/docs-rewrite/screenshots/desktop-x.png" alt="…"
        className="rounded-md border border-fd-border shadow-sm" />
   ```

## Notes

- The CLI auto-starts a local (loopback) AskUI Controller on port 23000, display
  1 — you don't need to start a controller separately, only the app.
- `agent_workspace/` (per-run reports + step screenshots) and `.env` are
  gitignored; only the curated PNGs in `public/screenshots/` are committed.
- `setup.md` opens AskUI Desktop from the Start menu and scopes capture to its
  window (via the agent's `list_windows` + `set_active_window` tools) before any
  test runs. Because setup and the tests share one agent session, the scope
  persists, so every `save_screenshot` PNG contains just the app window — no
  desktop, taskbar, or other windows. (Window selection is a device-layer
  capability in the AskUI SDK `alpha.18`: `set_active_window` adds the window as
  a virtual display and selects it, so screenshots capture just that window.)
  Setup runs even for a single-file target.
