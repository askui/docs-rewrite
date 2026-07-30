Keep the report short. These runs exist to capture documentation screenshots,
not to validate behaviour.

The report MUST begin with these two lines exactly (the runner parses the
`**Status:**` line to decide the overall verdict — omit it and the run is
marked BROKEN even when every screen was captured):

```
# <test name> - Report
**Status:** PASSED
```

Use `**Status:** PASSED` when every requested screen was captured, otherwise
`**Status:** FAILED`. The overall status is the worst of the individual screens.

After that head, add one line per screen: the screen name, the file name you
saved via `save_screenshot`, and whether the intended screen was visible when
you captured it (PASSED) or not (FAILED, with a one-line reason).
