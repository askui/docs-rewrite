// Captures the current screen and saves it as a named PNG for the docs.
// Runs on desktop (agent-os) runs — the (IAgentOs) constructor is injected by
// the runner. ScreenshotAsync() grabs whatever is currently in scope: the full
// display, or a single window if the agent has called set_active_window first
// (which the capture flow does, so shots are cropped to the app window). File
// I/O writes on the host machine (the one running the CLI), where docs-rewrite lives.

using AskUI.Imaging; // ImageData — not auto-injected

/// <summary>
/// Save a screenshot of the current screen to the docs asset folder so it can be
/// embedded in an MDX page. The agent calls this once it has navigated the AskUI
/// Desktop app to the screen a given doc page needs to show.
/// </summary>
public sealed class SaveScreenshotTool : Tool
{
    // Base output directory, resolved on the HOST running the CLI. The regenerate
    // wrapper sets DOCS_SCREENSHOTS_DIR to an absolute path; the default assumes
    // the CLI is invoked from the docs-rewrite repo root.
    private static readonly string OutputDir =
        Environment.GetEnvironmentVariable("DOCS_SCREENSHOTS_DIR") is { Length: > 0 } dir
            ? dir
            : Path.Combine("public", "screenshots");

    private readonly IAgentOs _agentOs;

    public SaveScreenshotTool(IAgentOs agentOs)
        : base(
            name: "save_screenshot",
            description:
                "Capture the current screen and save it as a documentation image. "
                + "Call this after navigating the app to the screen a doc page needs "
                + "to show. Give a descriptive, kebab-case name (no extension), e.g. "
                + "\"desktop-runs-live\". The saved file overwrites any previous one "
                + "with the same name so docs stay reproducible.",
            inputSchema: new JsonObject
            {
                ["type"] = "object",
                ["properties"] = new JsonObject
                {
                    ["name"] = new JsonObject
                    {
                        ["type"] = "string",
                        ["description"] =
                            "File name without extension, kebab-case. Becomes "
                            + "<name>.png in the docs screenshots folder.",
                    },
                },
                ["required"] = new JsonArray("name"),
            })
    {
        _agentOs = agentOs;
    }

    public override async ValueTask<ToolResult> InvokeAsync(
        JsonObject input, CancellationToken cancellationToken = default)
    {
        var rawName = input["name"]?.GetValue<string>() ?? "";

        // Sanitise: strip any extension, keep only safe chars — never let the
        // model write outside the asset folder via path traversal.
        var stem = Path.GetFileNameWithoutExtension(rawName);
        var name = Regex.Replace(stem, "[^a-zA-Z0-9-_]", "-").Trim('-').ToLowerInvariant();
        if (name.Length == 0)
        {
            return ToolResult.Error(
                "A non-empty kebab-case 'name' is required (letters, digits, '-', '_').");
        }

        var fullDir = Path.GetFullPath(OutputDir);
        Directory.CreateDirectory(fullDir);
        var path = Path.Combine(fullDir, $"{name}.png");

        var shot = await _agentOs.ScreenshotAsync(cancellationToken);
        await shot.SaveAsync(path, cancellationToken);

        // Return the captured image too, so the agent can visually confirm it
        // grabbed the intended screen before moving on.
        return ToolResult.FromTextAndImage(
            $"Saved {shot.Width}x{shot.Height} screenshot to {path}", shot);
    }
}
