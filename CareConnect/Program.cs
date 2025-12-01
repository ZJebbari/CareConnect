using CareConnect.Common;
using CareConnect.Hubs;
using CareConnect.Repositories;
using CareConnect.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// Load configuration (appsettings.json) into builder.Configuration
// This gives access to connection strings + JWT settings
// ============================================================
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// ============================================================
// DATABASE SERVICES
// - AddDbContext: registers EF Core DbContext for data access
// - IDbSession: custom Dapper database session for stored procs + transactions
// ============================================================
builder.Services.AddDbContext<CareConnectContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IDbSession>(provider =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
        throw new InvalidOperationException("Default connection string is not configured.");

    // DbSession automatically opens the SQL connection for every request
    return new DbSession(connectionString);
});

// ============================================================
// APPLICATION SERVICES
// These are injected into controllers using dependency injection
// They are scoped per request (new instance per HTTP call)
// ============================================================
builder.Services.AddScoped<IRepository, Repository>();
builder.Services.AddScoped<IService, Service>();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<IPasswordHasher<object>, PasswordHasher<object>>();


// ============================================================
// 🔐 JWT AUTHENTICATION
// - Reads Jwt:Key, Jwt:Issuer, Jwt:Audience from appsettings.json
// - Validates JWT tokens on every authorized request
// - Adds claims: NameIdentifier, Name, Role
// - REQUIRED for [Authorize] and [Authorize(Roles="Admin")]
// ============================================================
var jwtSection = builder.Configuration.GetSection("Jwt");
var keyBytes = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,                          // Must match configured Issuer
            ValidateAudience = true,                        // Must match configured Audience
            ValidateLifetime = true,                        // Token must not be expired
            ValidateIssuerSigningKey = true,                // Validate token signature using our secret key
            ValidIssuer = jwtSection["Issuer"],             // Your issuer from config
            ValidAudience = jwtSection["Audience"],         // Intended token audience
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes) // Secret used to sign token
        };
    });

// Enables role-based authorization [Authorize] / [Authorize(Roles="Admin")]
builder.Services.AddAuthorization();

// ============================================================
// SIGNALR + API + SWAGGER
// - AddSignalR: real-time websocket features
// - AddControllers: API controller support
// - Swagger: API testing UI
// ============================================================
builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Configured for dev use only

// ============================================================
// CORS POLICY (Cross-Origin Resource Sharing)
// - Allows Angular localhost:4200 to call this API
// - AllowCredentials important for tokens/cookies
// ============================================================
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        policy
            .WithOrigins("http://localhost:4200") // Angular dev URL
            .AllowAnyHeader()                    // Allow all request headers
            .AllowAnyMethod()                    // Allow GET/POST/PUT/DELETE
            .AllowCredentials();                 // Allow token/cookie authentication
    });
});

// ============================================================
// BUILD WEB APPLICATION
// After this, DI registration stops. Service collection becomes READ-ONLY.
// ============================================================
var app = builder.Build();

// ============================================================
// HTTP REQUEST PIPELINE MIDDLEWARE
// Order matters!
// ============================================================

if (app.Environment.IsDevelopment())
{
    // Swagger only visible in Development mode
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); // Force HTTPS security

app.UseCors(MyAllowSpecificOrigins); // Apply the CORS policy to all endpoints

// Authentication must come BEFORE Authorization
app.UseAuthentication(); // Validate JWT and attach ClaimsPrincipal to HttpContext.User
app.UseAuthorization();  // Enforce [Authorize] attributes

// Map route handlers
app.MapControllers(); // Maps all [ApiController] routes (/api/*)

app.MapHub<CareConnectHub>("/careconnectHub"); // SignalR hub endpoint for realtime updates

// Start the server
app.Run();
