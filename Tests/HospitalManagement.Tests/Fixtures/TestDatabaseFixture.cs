using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Utilities;
using Serilog;

namespace HospitalManagement.Tests.Fixtures
{
    public class TestDatabaseFixture : IDisposable
    {
        public HospitalDbContext Context { get; private set; }
        public IServiceProvider ServiceProvider { get; private set; }

        public TestDatabaseFixture()
        {
            Log.Information("Setting up test database fixture");

            var services = new ServiceCollection();

            services.AddDbContext<HospitalDbContext>(options =>
                options.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()));

            services.AddLogging(builder => builder.AddSerilog());

            ServiceProvider = services.BuildServiceProvider();
            Context = ServiceProvider.GetRequiredService<HospitalDbContext>();

            SeedTestData();
            Log.Information("Test database fixture setup completed");
        }

        private void SeedTestData()
        {
            Log.Information("Seeding test data");

            var testUsers = new List<User>
            {
                new User
                {
                    Id = 1,
                    FirstName = "Test",
                    LastName = "Admin",
                    Gender = "Male",
                    Age = 35,
                    UserId = "testadmin",
                    PasswordHash = PasswordHelper.HashPassword("Test@123"),
                    Email = "testadmin@test.com",
                    Address = "123 Test St",
                    City = "Test City",
                    State = "Test State",
                    Zip = "12345",
                    PhoneNo = "1234567890",
                    UserType = "Admin",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 2,
                    FirstName = "Test",
                    LastName = "Patient",
                    Gender = "Female",
                    Age = 30,
                    UserId = "testpatient",
                    PasswordHash = PasswordHelper.HashPassword("Test@123"),
                    Email = "testpatient@test.com",
                    Address = "456 Test Ave",
                    City = "Test City",
                    State = "Test State",
                    Zip = "12345",
                    PhoneNo = "0987654321",
                    UserType = "Patient",
                    CreatedAt = DateTime.UtcNow
                }
            };

            Context.Users.AddRange(testUsers);
            Context.SaveChanges();

            Log.Information("Test data seeding completed");
        }

        public void Dispose()
        {
            Log.Information("Disposing test database fixture");
            Context?.Dispose();
            ServiceProvider?.GetService<IServiceScope>()?.Dispose();
        }
    }
}