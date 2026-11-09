Keep the report short. These runs exist to capture documentation screenshots,
not to validate behaviour.

Begin the report with these two lines, using the status the test recorded:

```
# <test name> - Report
**Status:** <recorded status>
```

After that head, add one line per screen: the screen name, the file name the
agent saved via `save_screenshot`, and whether the intended screen was visible
when it was captured (PASSED) or not (FAILED, with a one-line reason).
