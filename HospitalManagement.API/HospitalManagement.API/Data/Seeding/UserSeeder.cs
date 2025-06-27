using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Utilities;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class UserSeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            // Check for admin user specifically
            if (!await context.Users.AnyAsync(u => u.UserType == "Admin"))
            {
                Log.Information("Seeding admin user...");
                var adminUser = new List<User>
                {
                    // Admin Users
                     new User
                     {
                        FirstName = "John",
                        LastName = "Admin",
                        Gender = "Male",
                        Age = 35,
                        UserId = "admin002",
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
                    },
                    new User
                    {
                        FirstName = "Ahmed",
                        LastName = "Ehab",
                        Gender = "Male",
                        Age = 28,
                        UserId = "admin001",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        Email = "ahmed.ehab@hospital.com",
                        Address = "123 Admin Street",
                        City = "Cairo",
                        State = "Cairo",
                        Zip = "11511",
                        PhoneNo = "+20-100-4567",
                        UserType = "Admin",
                        CreatedAt = DateTime.UtcNow,
                        LastLogin = DateTime.UtcNow.AddHours(-2)
                    },
                    new User
                    {
                        FirstName = "Sarah",
                        LastName = "Mohamed",
                        Gender = "Female",
                        Age = 32,
                        UserId = "admin003",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        Email = "sarah.mohamed@hospital.com",
                        Address = "456 Management Ave",
                        City = "Alexandria",
                        State = "Alexandria",
                        Zip = "21500",
                        PhoneNo = "+20-100-5678",
                        UserType = "Admin",
                        CreatedAt = DateTime.UtcNow.AddDays(-30),
                        LastLogin = DateTime.UtcNow.AddMinutes(-15)
                    },




                };

                await context.Users.AddRangeAsync(adminUser);
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
                    },
                    // Patient Users
                    new User
                    {
                        FirstName = "Liam",
                        LastName = "Harper",
                        Gender = "Male",
                        Age = 34,
                        UserId = "pat002",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient@123"),
                        Email = "liam.harper@email.com",
                        Address = "555 Patient Street",
                        City = "Cairo",
                        State = "Cairo",
                        Zip = "11511",
                        PhoneNo = "+20-100-8901",
                        UserType = "Patient",
                        CreatedAt = DateTime.UtcNow.AddDays(-20),
                        LastLogin = DateTime.UtcNow.AddHours(-1)
                    },
                    new User
                    {
                        FirstName = "Olivia",
                        LastName = "Bennett",
                        Gender = "Female",
                        Age = 29,
                        UserId = "pat003",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient@123"),
                        Email = "olivia.bennett@email.com",
                        Address = "777 Health Avenue",
                        City = "Alexandria",
                        State = "Alexandria",
                        Zip = "21500",
                        PhoneNo = "+20-100-9012",
                        UserType = "Patient",
                        CreatedAt = DateTime.UtcNow.AddDays(-15),
                        LastLogin = DateTime.UtcNow.AddMinutes(-30)
                    }
                };

                context.Users.AddRange(patientUsers);
                await context.SaveChangesAsync();
                Log.Information("Patient users seeded successfully.");
            }
        }
    }
}
