using System.Text.Json;
using api;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


app.MapPut("/rectangle/validate", async (Settings settings, CancellationToken cancellationToken) =>
{
    await Task.Delay(TimeSpan.FromSeconds(10), cancellationToken);

    if (DoesRectangleWidthExceedsHeight(settings.Width, settings.Height))
    {
        return Results.BadRequest("Rectangle width cannot exceed its height");
    }

    return Results.Ok();
})
.WithName("ValidateRectangle")
.WithOpenApi();

app.MapGet("/settings", async (CancellationToken cancellationToken) =>
    {
        await using var settingsFileStream = new FileStream("settings.json", FileMode.Open, FileAccess.Read);
        var settings = await JsonSerializer.DeserializeAsync<Settings>(settingsFileStream, cancellationToken: cancellationToken);
        return Results.Ok(settings);
    })
    .WithName("GetSettings")
    .WithOpenApi();

app.MapPut("/settings", async (Settings settings, CancellationToken cancellationToken) =>
    {
        if (DoesRectangleWidthExceedsHeight(settings.Width, settings.Height))
        {
            return Results.BadRequest("Rectangle width cannot exceed its height");
        }
        
        var settingsContent = JsonSerializer.Serialize(settings);
        await File.WriteAllTextAsync("settings.json", settingsContent, cancellationToken);
        return Results.Ok();
    })
    .WithName("UpdateSettings")
    .WithOpenApi();

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:3000"));

app.Run();

bool DoesRectangleWidthExceedsHeight(int width, int height)
{
    if (width > height)
    {
        return true;
    }

    return false;
}