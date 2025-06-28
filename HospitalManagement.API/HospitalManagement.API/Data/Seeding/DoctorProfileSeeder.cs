using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Utilities;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class DoctorProfileSeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            // Only check for doctors specifically
            if (!context.Users.Any(u => u.UserType == "Doctor"))
            {
                Log.Information("Seeding doctors and doctor profiles...");

                // Create doctor users first
                var doctors = new List<User>
                {
                    new User
                    {
                        FirstName = "Dr. Ahmed",
                        LastName = "Hassan",
                        Gender = "Male",
                        Age = 45,
                        UserId = "dr.ahmed",
                        PasswordHash  = PasswordHelper.HashPassword("Doctor@123"),
                        Email = "ahmed.hassan@hospital.com",
                        Address = "789 Doctor Street",
                        City = "Cairo",
                        State = "Cairo Governorate",
                        Zip = "11511",
                        PhoneNo = "+20-10-12345678",
                        UserType = "Doctor",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        FirstName = "Dr. Fatima",
                        LastName = "Ali",
                        Gender = "Female",
                        Age = 38,
                        UserId = "dr.fatima",
                        PasswordHash  = PasswordHelper.HashPassword("Doctor@123"),
                        Email = "fatima.ali@hospital.com",
                        Address = "321 Medical Avenue",
                        City = "Al Khosous",
                        State = "Cairo Governorate",
                        Zip = "11512",
                        PhoneNo = "+20-11-87654321",
                        UserType = "Doctor",
                        CreatedAt = DateTime.UtcNow
                    },
                    // Doctor Users
                    new User
                    {
                        FirstName = "Dr. Amelia",
                        LastName = "Carter",
                        Gender = "Female",
                        Age = 45,
                        UserId = "doctor001",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"),
                        Email = "amelia.carter@hospital.com",
                        Address = "789 Medical Center",
                        City = "Cairo",
                        State = "Cairo",
                        Zip = "11511",
                        PhoneNo = "+20-100-6789",
                        UserType = "Doctor",
                        CreatedAt = DateTime.UtcNow.AddDays(-60),
                        LastLogin = DateTime.UtcNow.AddMinutes(-5)
                    },
                    new User
                    {
                        FirstName = "Dr. Ethan",
                        LastName = "Bennett",
                        Gender = "Male",
                        Age = 38,
                        UserId = "doctor002",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"),
                        Email = "ethan.bennett@hospital.com",
                        Address = "321 Neurology Wing",
                        City = "Giza",
                        State = "Giza",
                        Zip = "12511",
                        PhoneNo = "+20-100-7890",
                        UserType = "Doctor",
                        CreatedAt = DateTime.UtcNow.AddDays(-45),
                        LastLogin = DateTime.UtcNow.AddMinutes(-10)
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
                };

                context.Users.AddRange(doctors);
                await context.SaveChangesAsync();

                // Create doctor profiles
                var doctorProfiles = new List<DoctorProfile>
                {
                    new DoctorProfile
                    {
                        UserId = doctors[0].Id,
                        HospitalName = "City General Hospital",
                        Qualification = "MD, FRCS",
                        Experience = 15,
                        SpecialistIn = "Cardiology",
                        CreatedAt = DateTime.UtcNow
                    },
                    new DoctorProfile
                    {
                        UserId = doctors[1].Id,
                        HospitalName = "Al Khosous Medical Center",
                        Qualification = "MD, PhD",
                        Experience = 12,
                        SpecialistIn = "Pediatrics",
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.DoctorProfiles.AddRange(doctorProfiles);
                await context.SaveChangesAsync();
                Log.Information("Doctors and doctor profiles seeded successfully.");
            }
        }
    }
}
