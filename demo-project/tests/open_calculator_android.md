# Open Calculator on Android

Run this on the **Pixel 9** device (the provisioned Android emulator).

## Preconditions
- The Pixel 9 emulator is connected (its `provision` block boots the
  `askui-pixel-9` AVD on connect and reuses it if already running).

## Steps
1. Go to the home screen.
2. Open the app drawer.
3. Launch the **Calculator** app.
4. Wait until the calculator opens.

## Postconditions
- Test passes if the Calculator app is open with its number pad visible.
