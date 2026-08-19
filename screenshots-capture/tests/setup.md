# Setup · Open and scope the AskUI Desktop app

Runs once before the capture tests. Leaves the AskUI Desktop app open, maximised,
and scoped so that every screenshot in the following tests contains only the app
window.

## Open the app
1. Take a screenshot to see the current desktop state.
2. If the **AskUI Desktop** app is not already open, launch it as follows:
   - On Windows: from the Windows Start menu: press the Windows key, type `AskUI Desktop`, and press Enter
   (installed under Programs at `C:\Program Files\AskUI Desktop`).
   - On Mac: Use Spotlight to search for `AskUI Desktop` and press Enter
4. Wait until the main window has fully loaded. If a sign-in screen is shown,
   report it as an issue and stop — do not attempt to log in.
5. Maximise the window so the captured content is large and consistent.

## Scope capture to the app window
5. Call `list_windows` and find the window whose `process_name` contains "AskUI.Desktop", e.g. `AskUI.Desktop.Windows` on Windows.
6. Call `set_active_window` with that window's `process_id` and `window_id`.
   Every screenshot from now on captures only that window — no desktop, taskbar,
   or other apps.
7. Take a screenshot to confirm the app window is framed correctly.
