# Capture · AskUI Desktop UI screenshots

Capture screenshots of the AskUI Desktop app's own screens for the documentation
site. Setup has already opened the app and scoped capture to its window, so every
`save_screenshot` below contains just the app window.

Before every `save_screenshot`, move the mouse to an empty area (e.g. the page
heading) and wait a moment so no tooltip or hover highlight is visible.

## Screens to capture

1. **A genuinely live run.** This is the one exception to the "never start
   runs" rule — start exactly this demo run and let it finish:
   1. Open the **Devices** page. If the **Pixel 9** profile is not connected,
      click **Start** and wait until it shows Ready (a cold boot can take
      several minutes — the card shows the phases).
   2. Open the **Tests** page and select `open_calculator_android.md`. Run it
      on the **Pixel 9** device (Run-on picker or right-click → Run on).
   3. Open the **Runs** page and select the run that just started. Wait until
      the conversation is visibly streaming — at least one agent message and
      one Android screenshot in the log, run still in progress.
   4. Call `save_screenshot[desktop-runs-live]` while the run is still
      executing.
   5. Let the run finish — do NOT stop it. When it is done, with the full
      conversation log of the finished run visible, call
      `save_screenshot[desktop-conversation-log]`.

2. Open the **Dashboard** page. Wait until its cards/counters have loaded, then
   call `save_screenshot[desktop-dashboard]`.

3. Open the **Devices** page (Device Center). Wait until the device list is
   shown, then call `save_screenshot[desktop-devices]`.

4. Still on the Devices page, click **Add profile**. When the dialog with the
   device-kind cards is shown, call `save_screenshot[desktop-add-profile]`.

5. In the same dialog, select the **Remote computer** kind so its fields (Host,
   Port, Display) are shown, then call
   `save_screenshot[desktop-profile-remote-computer]`.

6. Select the **Web browser** kind (Browser, Start URL, Headless fields), then
   call `save_screenshot[desktop-profile-web-browser]`.

7. Select the **Android emulator** kind (Device type, System image, Lifecycle),
   wait until its dropdowns have loaded, then call
   `save_screenshot[desktop-profile-android-emulator]`.

8. Select the **Multi computer** kind (rows of Name/Host/Port/Display), then
   call `save_screenshot[desktop-profile-multi-computer]`.

9. Close the dialog with **Cancel** — do NOT save any profile.

10. Open the **Tests** page and select an existing test file so its editor and
    the Run controls (Run button, Run-on picker) are visible. Call
    `save_screenshot[desktop-tests-run]`.

11. Right-click on an empty area of the file tree (below the last file) so the
    context menu opens with its **Create** section — "New Markdown",
    "New CSV", "New folder", and any "New setup.md"-style entries. With the
    menu open, call `save_screenshot[desktop-tests-context-menu]`, then press
    Escape to close it — do NOT click any menu entry.

12. Click the alarm-clock button next to the Run controls to open the
    **Scheduled runs** dialog. When it is shown, call
    `save_screenshot[desktop-schedule-dialog]`, then close it — do NOT add a
    schedule.

13. Open the **Utils** page, **Tool Store** tab. Wait for the tool list, then call
    `save_screenshot[desktop-utils-tools]`.

14. Switch to the **Secrets** tab, then call
    `save_screenshot[desktop-utils-secrets]`. Do NOT add, edit, or reveal any
    secret.

15. Switch to the **MCP** tab, then call `save_screenshot[desktop-utils-mcp]`.

16. With the demo project open, click the git branch chip in the top bar so
    the source-control flyout opens (changes list, commit field, sync row).
    Call `save_screenshot[desktop-git-chip]`, then press Escape — do NOT
    commit or sync.

17. On the **Tests** page with a test open, click the chevron of the **Run**
    split button so the profile dropdown (Run on) opens. Call
    `save_screenshot[desktop-run-dropdown]`, then press Escape — do NOT
    start a run this way.

## Done
The capture is successful when each screen above was shown and saved. Report one
line per screen per the report format.
