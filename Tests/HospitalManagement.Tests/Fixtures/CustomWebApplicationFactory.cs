using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using HospitalManagement.API.Data;
using Serilog;

namespace HospitalManagement.Tests.Fixtures
{
    public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            Log.Information("Configuring test web host");

            builder.ConfigureAppConfiguration((context, config) =>
            {
                // Add test-specific configuration
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] = GetTestConnectionString(),
                    ["JwtSettings:SecretKey"] = "YourSuperSecretKeyThatIsAtLeast32CharactersLongForSecurity!",
                    ["JwtSettings:Issuer"] = "HospitalManagement.API",
                    ["JwtSettings:Audience"] = "HospitalManagement.Client",
                    ["JwtSettings:ExpiryInMinutes"] = "60"
                });
            });

            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registration
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<HospitalDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Remove any DbContext registrations
                var contextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(HospitalDbContext));
                if (contextDescriptor != null)
                {
                    services.Remove(contextDescriptor);
                }

                // Use SQL Server for integration tests if connection string is available, otherwise use InMemory
                var connectionString = GetTestConnectionString();
                if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("Server=localhost"))
                {
                    // Integration test with SQL Server
                    services.AddDbContext<HospitalDbContext>(options =>
                    {
                        options.UseSqlServer(connectionString);
                    });
                }
                else
                {
                    // Fallback to InMemory for unit tests
                    services.AddDbContext<HospitalDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("InMemoryDbForTesting");
                    });
                }

                // Build service provider and ensure database is created
                var serviceProvider = services.BuildServiceProvider();
                using var scope = serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();

                try
                {
                    if (connectionString?.Contains("Server=localhost") == true)
                    {
                        context.Database.EnsureCreated();
                        Log.Information("Test SQL Server database created successfully");
                    }
                    else
                    {
                        context.Database.EnsureCreated();
                        Log.Information("Test InMemory database created successfully");
                    }
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "Error occurred creating test database");
                    throw;
                }
            });

            builder.UseEnvironment("Testing");
            Log.Information("Test web host configuration completed");
        }

        private static string GetTestConnectionString()
        {
            return Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                   ?? "Data Source=:memory:";
        }
    }
}
