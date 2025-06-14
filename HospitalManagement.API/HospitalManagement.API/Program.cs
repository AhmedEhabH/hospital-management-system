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
    });


// --------- Repository Registrations ---------
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMedicalHistoryRepository, MedicalHistoryRepository>();
builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
builder.Services.AddScoped<ILabReportRepository, LabReportRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();

Log.Information("All repositories registered in DI container.");

// --------- Service Registrations ---------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMedicalHistoryService, MedicalHistoryService>();
Log.Information("AuthService and MedicalHistoryService registered in DI container.");
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
Log.Information("FeedbackService registered in DI container.");
builder.Services.AddScoped<ILabReportService, LabReportService>();
Log.Information("LabReportService registered in DI container.");
builder.Services.AddScoped<IMessageService, MessageService>();
Log.Information("MessageService registered in DI container.");
builder.Services.AddScoped<IHospitalService, HospitalService>();
Log.Information("HospitalService registered in DI container.");


// --------- JwtHelper Registration ---------
//builder.Services.AddSingleton<JwtHelper>();
//Log.Information("JwtHelper registered as singleton in DI container.");
builder.Services.AddSingleton<IJwtHelper, JwtHelper>();
Log.Information("IJwtHelper registered as singleton in DI container.");

// --------- Swagger/OpenAPI Setup ---------
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
    app.UseSwaggerUI();
    Log.Information("Swagger enabled in development environment");
}

// --------- Enable CORS Middleware ---------
app.UseCors("AllowAngularApp");

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

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