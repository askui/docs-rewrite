# Setup · Open and scope the AskUI Desktop app

Runs once before the capture tests. Leaves the AskUI Desktop app open, maximised,
and scoped so that every screenshot in the following tests contains only the app
window.

## Open the app
1. Take a screenshot to see the current desktop state and note the operating
   system (Windows taskbar vs. macOS menu bar).
2. If an **AskUI Desktop** window is already open (the operator may have
   started a development build from the app repo), use it — do not launch
   another instance. Otherwise launch the installed app:
   - **Windows**: press the Windows key, type `AskUI Desktop`, and press Enter
     (installed under Programs at `C:\Program Files\AskUI Desktop`).
   - **macOS**: press Cmd+Space to open Spotlight, type `AskUI Desktop`, and
     press Enter (installed in `/Applications`).
3. Wait until the main window has fully loaded. If a sign-in screen is shown,
   report it as an issue and stop — do not attempt to log in.
4. Maximise the window so the captured content is large and consistent
   (on macOS use the green zoom button's maximise, not full-screen mode —
   full-screen moves the app to its own space and hides the title bar).

## Scope capture to the app window
5. Call `list_windows` and find the app's main window: the one whose
   **`title` starts with "AskUI Desktop"**. Match by title, not process —
   the process is `AskUI.Desktop.Windows` (Windows install), `AskUI Desktop`
   (macOS install), or `dotnet` (a development build started from the app
   repo). Ignore the tiny `AskuiRemoteDeviceController` helper windows.
6. Call `set_active_window` with that window's `process_id` and `window_id`.
   Every screenshot from now on captures only that window — no desktop, taskbar,
   or other apps.
7. Take a screenshot to confirm the app window is framed correctly.
