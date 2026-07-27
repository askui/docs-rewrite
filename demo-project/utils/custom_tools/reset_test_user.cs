public sealed class ResetTestUserTool : Tool, ISecretsConsumer
{
    private string _apiKey = "";

    public ResetTestUserTool()
        : base(
            name: "reset_test_user",
            description: "Resets a test user to a clean state via the admin API.",
            inputSchema: new JsonObject
            {
                ["type"] = "object",
                ["properties"] = new JsonObject
                {
                    ["username"] = new JsonObject { ["type"] = "string" },
                },
                ["required"] = new JsonArray("username"),
            })
    {
    }

    public void UseSecrets(IReadOnlyDictionary<string, string> secrets) =>
        _apiKey = secrets.GetValueOrDefault("ADMIN_API_KEY", "");

    public override async ValueTask<ToolResult> InvokeAsync(
        JsonObject input, CancellationToken cancellationToken = default)
    {
        using var http = new HttpClient();
        http.DefaultRequestHeaders.Add("X-Api-Key", _apiKey);
        var response = await http.PostAsync(
            $"https://admin.example.com/api/users/{input["username"]}/reset",
            content: null, cancellationToken);
        return response.IsSuccessStatusCode
            ? ToolResult.FromText($"User {input["username"]} was reset.")
            : ToolResult.Error($"Admin API returned {(int)response.StatusCode}.");
    }
}
