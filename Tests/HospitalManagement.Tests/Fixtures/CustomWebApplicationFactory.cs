using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using HospitalManagement.API.Data;
using Serilog;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace HospitalManagement.Tests.Fixtures
{
    public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            Log.Information("Configuring test web host");

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

                // Remove any IDbContextOptionsConfiguration registrations (EF Core 8+ issue)
                var optionsConfigDescriptors = services
                    .Where(d => d.ServiceType.IsGenericType &&
                               d.ServiceType.GetGenericTypeDefinition() == typeof(IDbContextOptionsConfiguration<>))
                    .ToList();

                foreach (var optionsConfigDescriptor in optionsConfigDescriptors)
                {
                    services.Remove(optionsConfigDescriptor);
                }

                // Add in-memory database for testing
                services.AddDbContext<HospitalDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                });

                // Build service provider and ensure database is created
                var serviceProvider = services.BuildServiceProvider();
                using var scope = serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();

                try
                {
                    context.Database.EnsureCreated();
                    Log.Information("Test database created successfully");
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
    }
}
