#:package SixLabors.ImageSharp@3.1.7

using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

public sealed class CompareWithReferenceTool : Tool
{
    private readonly IAndroidAgentOs _agentOs;

    public CompareWithReferenceTool(IAndroidAgentOs agentOs)
        : base(
            name: "compare_with_reference",
            description: "Compares the current screen against a reference image. "
                + "Returns the deviation in percent and a difference image "
                + "with deviating pixels marked red.",
            inputSchema: new JsonObject
            {
                ["type"] = "object",
                ["properties"] = new JsonObject
                {
                    ["reference"] = new JsonObject
                    {
                        ["type"] = "string",
                        ["description"] = "Path to the reference PNG, e.g. utils/references/dashboard.png",
                    },
                },
                ["required"] = new JsonArray("reference"),
            })
    {
        _agentOs = agentOs;
    }

    public override async ValueTask<ToolResult> InvokeAsync(
        JsonObject input, CancellationToken cancellationToken = default)
    {
        var screenshot = await _agentOs.ScreenshotAsync(cancellationToken);
        using var actual = Image.Load<Rgba32>(screenshot.PngBytes);
        using var expected = Image.Load<Rgba32>(input["reference"]!.GetValue<string>());
        expected.Mutate(e => e.Resize(actual.Width, actual.Height));

        long deviating = 0;
        using var diff = new Image<Rgba32>(actual.Width, actual.Height);
        for (var y = 0; y < actual.Height; y++)
            for (var x = 0; x < actual.Width; x++)
            {
                var same = actual[x, y] == expected[x, y];
                if (!same) deviating++;
                diff[x, y] = same ? actual[x, y] : new Rgba32(255, 0, 0);
            }

        using var png = new MemoryStream();
        await diff.SaveAsPngAsync(png, cancellationToken);
        var percent = 100.0 * deviating / (actual.Width * (long)actual.Height);
        return ToolResult.FromTextAndImage(
            $"{percent:F2}% of the pixels deviate from the reference (marked red).",
            ImageData.FromBytes(png.ToArray()));
    }
}
