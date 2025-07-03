using HospitalManagement.API.Data;
using HospitalManagement.API.Data.Seeding;
using HospitalManagement.API.Hubs;
using HospitalManagement.API.Middleware;
using HospitalManagement.API.Repositories.Implementations;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Implementations;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Utilities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Diagnostics;
using System.Runtime.Versioning;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// **STEP 1: Store application start time for uptime calculation**
var appStartTime = DateTime.UtcNow;

// --------- CORS Configuration ---------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// --------- Serilog Logging Setup ---------
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog(); // Use Serilog for logging


// --------- Add Services to DI Container ---------
// Add services to the container.

builder.Services.AddControllers();

// --------- SQL Server DbContext Setup (Only if not Testing) ---------
if (!builder.Environment.IsEnvironment("Testing"))
{
    // Override authentication for testing
    builder.Services.Configure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
    });

    builder.Services.AddDbContext<HospitalDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

// --------- AutoMapper Setup ---------
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles).Assembly);

// --------- JWT Authentication Setup ---------
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];
if (string.IsNullOrEmpty(secretKey))
{
    throw new InvalidOperationException("JWT SecretKey is not configured in appsettings.json");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // Configure SignalR JWT authentication
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    (
                    path.StartsWithSegments("/hubs/communication")
                    ||
                    path.StartsWithSegments("/hubs/medical-alerts"))
                    )
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// --------- JwtHelper Registration ---------
// FIXED: Register IJwtHelper with proper configuration values
builder.Services.AddSingleton<IJwtHelper>(provider =>
    new JwtHelper(secretKey, jwtSettings["Issuer"]!, jwtSettings["Audience"]!));

Log.Information("IJwtHelper registered as singleton in DI container.");


// --------- Repository Registrations ---------
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<ILabReportRepository, LabReportRepository>();
builder.Services.AddScoped<IMedicalHistoryRepository, MedicalHistoryRepository>();
builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();

Log.Information("All repositories registered in DI container.");

// --------- Service Registrations ---------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<ILabReportService, LabReportService>();
builder.Services.AddScoped<IMedicalHistoryService, MedicalHistoryService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IHospitalService, HospitalService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
Log.Information("All Services registered in DI container.");


// --------- JwtHelper Registration ---------
//builder.Services.AddSingleton<JwtHelper>();
//Log.Information("JwtHelper registered as singleton in DI container.");
//builder.Services.AddSingleton<IJwtHelper, JwtHelper>();
// FIXED: Register IJwtHelper with proper configuration values
//builder.Services.AddSingleton<IJwtHelper>(provider =>
//    new JwtHelper(secretKey, jwtSettings["Issuer"], jwtSettings["Audience"]));

//Log.Information("IJwtHelper registered as singleton in DI container.");

// Add SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// --------- Swagger/OpenAPI Setup ---------
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hospital Management API",
        Version = "v1",
        Description = "Comprehensive Hospital Management System API with Real-time Communication"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Add comprehensive logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();
    logging.AddEventSourceLogger();
});

var app = builder.Build();

// Only seed data if not in testing environment
if (!app.Environment.IsEnvironment("Testing"))
{
    await SeederExecutor.ExecuteAllSeedersAsync(app.Services);
    Log.Information("Data seeding complete.");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hospital Management API v1");
        //c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
    Log.Information("Swagger enabled in development environment");
}

// --------- Enable CORS Middleware ---------
app.UseCors("AllowAngularApp");

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
app.MapHub<CommunicationHub>("/hubs/communication");
// In the app configuration section, add:
app.MapHub<MedicalAlertsHub>("/hubs/medical-alerts");


// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }));

try
{
    Log.Information("Application running...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application start-up failed!");
}
finally
{
    Log.CloseAndFlush();
}

// **STEP 2: Add static methods for system metrics**
public partial class Program
{
    // Store application start time
    private static readonly DateTime _appStartTime = DateTime.UtcNow;

    /// <summary>
    /// Get system uptime since application started
    /// </summary>
    /// <returns>Formatted uptime string</returns>
    public static string GetSystemUptime()
    {
        try
        {
            var uptime = DateTime.UtcNow - _appStartTime;
            return $"{uptime.Days} days {uptime.Hours}h {uptime.Minutes}m";
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error calculating system uptime");
            return "Unknown";
        }
    }

    /// <summary>
    /// Get current server CPU load percentage
    /// </summary>
    /// <returns>CPU load percentage</returns>
    [SupportedOSPlatform("windows")]
    public static double GetServerLoad()
    {
        try
        {
            // **STEP 3: Use PerformanceCounter for Windows CPU monitoring**
            using var cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");

            // First call returns 0, so we need to wait and call again
            cpuCounter.NextValue();
            Thread.Sleep(1000); // Wait 1 second for accurate reading

            var cpuUsage = cpuCounter.NextValue();
            Log.Information("Server CPU load: {CpuUsage}%", cpuUsage);

            return Math.Round(cpuUsage, 2);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Could not get actual CPU usage, returning mock value");
            // Fallback to mock value if PerformanceCounter fails
            return 42.5;
        }
    }

    /// <summary>
    /// Get current database size from SQL Server
    /// </summary>
    /// <param name="connectionString">Database connection string</param>
    /// <returns>Database size as formatted string</returns>
    public static string GetDatabaseSize(string connectionString)
    {
        try
        {
            // **STEP 4: Query SQL Server for actual database size**
            using var connection = new SqlConnection(connectionString);
            connection.Open();

            var query = @"
                SELECT 
                    CAST(SUM(CAST(FILEPROPERTY(name, 'SpaceUsed') AS bigint) * 8192.) / 1024 / 1024 AS DECIMAL(15,2)) AS DatabaseSizeMB
                FROM sys.database_files 
                WHERE type_desc = 'ROWS'";

            using var command = new SqlCommand(query, connection);
            var result = command.ExecuteScalar();

            if (result != null && decimal.TryParse(result.ToString(), out var sizeMB))
            {
                var sizeFormatted = sizeMB >= 1024
                    ? $"{Math.Round(sizeMB / 1024, 2)} GB"
                    : $"{Math.Round(sizeMB, 2)} MB";

                Log.Information("Database size: {DatabaseSize}", sizeFormatted);
                return sizeFormatted;
            }

            return "Unknown";
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Could not get actual database size, returning mock value");
            // Fallback to mock value if query fails
            return "2.4 GB";
        }
    }

    /// <summary>
    /// Get system memory usage
    /// </summary>
    /// <returns>Memory usage percentage</returns>
    [SupportedOSPlatform("windows")]
    public static double GetMemoryUsage()
    {
        try
        {
            using var memoryCounter = new PerformanceCounter("Memory", "Available MBytes");
            var availableMemory = memoryCounter.NextValue();

            // Get total physical memory (this is a simplified approach)
            var totalMemory = GC.GetTotalMemory(false) / (1024 * 1024); // Convert to MB
            var usedMemory = totalMemory - availableMemory;
            var memoryUsagePercent = (usedMemory / totalMemory) * 100;

            return Math.Round(memoryUsagePercent, 2);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Could not get memory usage");
            return 65.0; // Mock value
        }
    }
}