# Enable airplane mode on Android

Run this on the **Pixel 9** device (the provisioned Android emulator).

## Preconditions
- The Pixel 9 emulator is connected (its `provision` block boots the
  `askui-pixel-9` AVD on connect and reuses it if already running).
- Airplane mode is **off** at the start.

## Steps
1. Go to the home screen.
2. Open the **Settings** app.
3. Open **Network & internet**.
4. Turn **Airplane mode** on.
5. Confirm the toggle is on and the status bar shows the airplane icon.
6. Turn **Airplane mode** off again, so the device is left as it was found.

## Postconditions
- Test passes if airplane mode could be switched on, was visibly reflected in the
  status bar, and was switched back off.
- The device is left with airplane mode off and connectivity restored.
