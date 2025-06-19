using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using HospitalManagement.API.Data;
using HospitalManagement.Tests.Helpers;
using Microsoft.AspNetCore.Authentication;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Utilities;

namespace HospitalManagement.Tests.Fixtures
{
    public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove the app's ApplicationDbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<HospitalDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add ApplicationDbContext using an in-memory database for testing
                services.AddDbContext<HospitalDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                });

                // Remove existing authentication services
                var authDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IAuthenticationService));
                if (authDescriptor != null)
                {
                    services.Remove(authDescriptor);
                }

                // FIXED: Remove existing IJwtHelper registration and add test-specific one
                var jwtDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IJwtHelper));
                if (jwtDescriptor != null)
                {
                    services.Remove(jwtDescriptor);
                }

                // Register IJwtHelper with test configuration
                services.AddSingleton<IJwtHelper>(provider =>
                    new JwtHelper(
                        "TestSecretKeyThatIsAtLeast32CharactersLongForTesting",
                        "TestIssuer",
                        "TestAudience"
                    ));

                // Add test authentication
                services.AddAuthentication(TestAuthHandler.AuthenticationScheme)
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                        TestAuthHandler.AuthenticationScheme, options => { });

                // Build the service provider
                var sp = services.BuildServiceProvider();

                // Create a scope to obtain a reference to the database context
                using (var scope = sp.CreateScope())
                {
                    var scopedServices = scope.ServiceProvider;
                    var db = scopedServices.GetRequiredService<HospitalDbContext>();
                    var logger = scopedServices.GetRequiredService<ILogger<CustomWebApplicationFactory<TStartup>>>();

                    // Ensure the database is created
                    db.Database.EnsureCreated();

                    try
                    {
                        // Seed the database with test data
                        SeedTestData(db);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "An error occurred seeding the database with test messages. Error: {Message}", ex.Message);
                    }
                }
            });

            builder.UseEnvironment("Testing");
        }

        private static void SeedTestData(HospitalDbContext context)
        {
            // Clear existing data
            context.Users.RemoveRange(context.Users);
            context.SaveChanges();

            // Add test users
            var testUsers = new[]
            {
                new HospitalManagement.API.Models.Entities.User
                {
                    Id = 1,
                    FirstName = "Test",
                    LastName = "Patient",
                    Gender = "Male",
                    Age = 30,
                    UserId = "test001",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                    Email = "test@hospital.com",
                    Address = "123 Test Street",
                    City = "Test City",
                    State = "Test State",
                    Zip = "12345",
                    PhoneNo = "1234567890",
                    UserType = "Patient",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new HospitalManagement.API.Models.Entities.User
                {
                    Id = 2,
                    FirstName = "Test",
                    LastName = "Doctor",
                    Gender = "Female",
                    Age = 35,
                    UserId = "doc001",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"),
                    Email = "doctor@hospital.com",
                    Address = "456 Medical Avenue",
                    City = "Test City",
                    State = "Test State",
                    Zip = "12346",
                    PhoneNo = "0987654321",
                    UserType = "Doctor",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Users.AddRange(testUsers);
            context.SaveChanges();
        }
    }
}
