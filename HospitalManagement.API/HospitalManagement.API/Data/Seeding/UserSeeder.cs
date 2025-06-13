using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Utilities;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class UserSeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            // Check for admin user specifically
            if (!context.Users.Any(u => u.UserType == "Admin"))
            {
                Log.Information("Seeding admin user...");
                var adminUser = new User
                {
                    FirstName = "Admin",
                    LastName = "User",
                    Gender = "Male",
                    Age = 40,
                    UserId = "admin",
                    PasswordHash = PasswordHelper.HashPassword("Admin@123"),
                    Email = "admin@hospital.com",
                    Address = "123 Admin Road",
                    City = "Cairo",
                    State = "Cairo Governorate",
                    Zip = "11511",
                    PhoneNo = "+20-2-12345678",
                    UserType = "Admin",
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
                Log.Information("Admin user seeded successfully.");
            }

            // Check for patient users specifically
            if (!context.Users.Any(u => u.UserType == "Patient"))
            {
                Log.Information("Seeding patient users...");
                var patientUsers = new List<User>
                {
                    new User
                    {
                        FirstName = "John",
                        LastName = "Doe",
                        Gender = "Male",
                        Age = 32,
                        UserId = "johndoe",
                        PasswordHash = PasswordHelper.HashPassword("Patient@123"),
                        Email = "john.doe@email.com",
                        Address = "456 Patient Street",
                        City = "Al Khosous",
                        State = "Cairo Governorate",
                        Zip = "11512",
                        PhoneNo = "+20-10-87654321",
                        UserType = "Patient",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        FirstName = "Sarah",
                        LastName = "Smith",
                        Gender = "Female",
                        Age = 28,
                        UserId = "sarahsmith",
                        PasswordHash = PasswordHelper.HashPassword("Patient@123"),
                        Email = "sarah.smith@email.com",
                        Address = "789 Health Avenue",
                        City = "Cairo",
                        State = "Cairo Governorate",
                        Zip = "11513",
                        PhoneNo = "+20-11-11223344",
                        UserType = "Patient",
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.Users.AddRange(patientUsers);
                await context.SaveChangesAsync();
                Log.Information("Patient users seeded successfully.");
            }
        }
    }
}
