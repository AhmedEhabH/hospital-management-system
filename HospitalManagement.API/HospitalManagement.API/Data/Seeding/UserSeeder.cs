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
                    FirstName = "John",
                    LastName = "Admin",
                    Gender = "Male",
                    Age = 35,
                    UserId = "admin001",
                    // FIXED: Use Password property instead of PasswordHash
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Email = "admin@hospital.com",
                    Address = "123 Hospital Street",
                    City = "Medical City",
                    State = "Healthcare State",
                    Zip = "12345",
                    PhoneNo = "+1-555-0001",
                    UserType = "Admin",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
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
                        FirstName = "Michael",
                    LastName = "Patient",
                    Gender = "Male",
                    Age = 28,
                    UserId = "pat001",
                    // FIXED: Use Password property instead of PasswordHash
                    PasswordHash  = BCrypt.Net.BCrypt.HashPassword("Patient@123"),
                    Email = "michael.patient@email.com",
                    Address = "789 Patient Lane",
                    City = "Medical City",
                    State = "Healthcare State",
                    Zip = "12347",
                    PhoneNo = "+1-555-0003",
                    UserType = "Patient",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        FirstName = "Sarah",
                    LastName = "Johnson",
                    Gender = "Female",
                    Age = 42,
                    UserId = "doc001",
                    // FIXED: Use Password property instead of PasswordHash
                    PasswordHash  = BCrypt.Net.BCrypt.HashPassword("Doctor@123"),
                    Email = "sarah.johnson@hospital.com",
                    Address = "456 Medical Avenue",
                    City = "Medical City",
                    State = "Healthcare State",
                    Zip = "12346",
                    PhoneNo = "+1-555-0002",
                    UserType = "Doctor",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                    }
                };

                context.Users.AddRange(patientUsers);
                await context.SaveChangesAsync();
                Log.Information("Patient users seeded successfully.");
            }
        }
    }
}
