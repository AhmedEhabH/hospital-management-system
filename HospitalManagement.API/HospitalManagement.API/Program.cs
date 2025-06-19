using HospitalManagement.API.Data;
using HospitalManagement.API.Repositories.Implementations;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Services.Implementations;
using HospitalManagement.API.Utilities;
using Microsoft.EntityFrameworkCore;
using Serilog;
using HospitalManagement.API.Middleware;
using HospitalManagement.API.Data.Seeding;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using HospitalManagement.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// --------- CORS Configuration ---------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
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

        // FIXED: Configure SignalR JWT authentication
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs/communication"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });


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
Log.Information("All Services registered in DI container.");


// --------- JwtHelper Registration ---------
//builder.Services.AddSingleton<JwtHelper>();
//Log.Information("JwtHelper registered as singleton in DI container.");
builder.Services.AddSingleton<IJwtHelper, JwtHelper>();
Log.Information("IJwtHelper registered as singleton in DI container.");

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

public partial class Program { }