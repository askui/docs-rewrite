# AskUI Desktop demo project

A small, self-contained operator project to open in **AskUI Desktop** — it gives
the app realistic content (devices + test cases + runs) for demos and for the
documentation screenshots.

## Open it

In AskUI Desktop: **Open project** → select this `demo-project` folder. The
Devices, Tests, Runs and Dashboard pages then populate from the files here.

## Devices (`devices.json`)

| Device | Type | Used by |
|---|---|---|
| Windows Desktop | `agent-os` (Core Service, `localhost:26000`) | Open Notepad on Windows |
| Chrome Browser | `web-browser` (Playwright) | Open askui.com in Chrome |
| Android Emulator | `android` (adb, `emulator-5554`) | Enable airplane mode on Android |

## Test cases (`tests/`)

1. `open_notepad_windows.md` — Open Notepad from the Start menu.
2. `open_askui_com_chrome.md` — Navigate to askui.com.
3. `enable_airplane_mode_android.md` — Toggle airplane mode in Settings.
   (Settings, rather than an app like Calculator, because the stock
   `google_apis` image this AVD uses does not ship one — see the Android
   guide's note on lean emulator images.)

Each test names the device it targets at the top; pick that device in the
**Run on** dropdown when you run it.

## Producing the 3 runs

Runs are created by executing the tests in the app (nothing is pre-fabricated):

1. Connect the three devices on the **Devices** page (the emulator must be
   booted; Chrome installs its Playwright bundle on first connect).
2. On the **Tests** page, run each test against its device.
3. The **Runs** and **Dashboard** pages then show the three runs and their
   reports.

## Notes

- The Android profile points at the default emulator serial `emulator-5554`.
  If your emulator uses a different serial, edit it on the Devices page or in
  `devices.json`.
- No credentials live here. The agent's model credentials come from the app's
  signed-in session (or a `.env` for CLI runs).
- `utils/format.md` defines the report shape. It must include the
  `**Status:** PASSED` line — the runner parses that to set each run's verdict;
  without it a passing run is recorded as BROKEN.
