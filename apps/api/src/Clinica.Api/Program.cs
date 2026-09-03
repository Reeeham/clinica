using System.Text;
using Clinica.Infrastructure.Auth;
using Clinica.Infrastructure.Data;
using Clinica.Infrastructure.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using Serilog;

// Enable legacy timestamp behavior (allows Unspecified DateTime kinds)
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Clear JWT claim type mapping so short names like "role" are preserved
System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// Load local development overrides (gitignored — for dev secrets like Jwt:Secret)
builder.Configuration.AddJsonFile("appsettings.Development.local.json", optional: true, reloadOnChange: true);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// DbContext
builder.Services.AddDbContext<ClinicaDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Auth
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "clinica",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "clinica-client",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret is not configured. Set it via environment variable Jwt__Secret."))),
            NameClaimType = "name",
            RoleClaimType = "role",
        };
        options.MapInboundClaims = false;
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Customer", policy => policy.RequireClaim("role", "customer"));
});

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Clinica API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
            },
            Array.Empty<string>()
        },
    });
});

var app = builder.Build();

// Apply pending migrations on every boot. Seed only in Development or when
// SEED_DATA=true is set explicitly (seeding is a no-op if a clinic exists).
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ClinicaDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

    await db.Database.MigrateAsync();

    if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("SEED_DATA"))
    {
        Log.Information("Seeding database");
        await DbSeeder.SeedAsync(db, hasher);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
