# Execution rules — documentation screenshot capture

## Purpose
These runs drive the **AskUI Desktop** app only to capture clean screenshots for
the documentation site. You are not testing anything — navigate, confirm the
right screen is shown, capture it, move on.

## Interaction
- Use the desktop computer. Interact with the AskUI Desktop app via mouse clicks,
  keyboard input, and window management.
- Setup (`setup.md`) opens the app and scopes capture to its window with
  `set_active_window`, so screenshots contain only the app. If the scope is ever
  lost, re-select the window before capturing.
- Before each `save_screenshot`, verify the intended screen is fully loaded and
  free of transient state (no half-open menus, loading spinners, or stray
  tooltips) unless the screenshot is meant to show exactly that.
- Move the mouse to a neutral area (e.g. the page heading) before every
  `save_screenshot` — a cursor resting on a nav icon leaves its tooltip in the
  shot.
- Use the exact screenshot `name` given in the step — doc pages reference these
  file names.

## Do no harm
- Do NOT start, stop, or delete runs, devices, projects, or any data. Only
  navigate and read. If reaching a screen would require creating or mutating
  data, mark that capture FAILED and continue rather than changing state.
- ONE exception, only when a capture step explicitly says so: connect/start
  the named demo device and run the named demo test, and let that run finish.
  Never abort it, never run anything else, never run on the desktop device
  (it would fight this capture session for the mouse).
- Do NOT sign out.

## Never photograph an error
A screenshot becomes documentation, so an error caught in one becomes documentation
too. **No captured image may contain an error state** — no error toast, red
validation text, empty-because-it-failed list, "something went wrong" panel, broken
image placeholder, or dialog left over from a failed action.

If you find the app in such a state:
1. **Recover it first.** Dismiss the toast, close the stray dialog with Cancel or
   Escape, navigate away and back, or press the screen's own Refresh/Retry control.
2. Confirm with a fresh screenshot (a plain `screenshot`, not `save_screenshot`)
   that the screen is clean.
3. Only then take the `save_screenshot`.

**If the state cannot be recovered, FAIL that capture.** Do not save the image
anyway, do not photograph a partially-loaded screen hoping it looks close enough,
and do not substitute a different screen under the requested name. A missing
screenshot is a visible gap someone fixes; a wrong one ships silently and teaches
readers something untrue.

The one exception is a capture whose step explicitly asks for that state (e.g. a
step demonstrating a validation message) — then it is the subject, not an error.

## Error handling
- If an infrastructure or tool exception occurs (e.g. gRPC error, connection
  lost), mark the capture BROKEN, write the report, and call `exception_tool`
  to abort.
- If a screen cannot be reached, mark that one capture FAILED and continue with
  the remaining captures.
