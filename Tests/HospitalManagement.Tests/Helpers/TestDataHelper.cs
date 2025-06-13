using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Utilities;

namespace HospitalManagement.Tests.Helpers
{
    public static class TestDataHelper
    {
        public static User CreateTestUser(string userId = "testuser", string userType = "Patient")
        {
            return new User
            {
                Id = 1,
                FirstName = "Test",
                LastName = "User",
                Gender = "Male",
                Age = 30,
                UserId = userId,
                PasswordHash = PasswordHelper.HashPassword("Test@123"),
                Email = $"{userId}@test.com",
                Address = "123 Test St",
                City = "Test City",
                State = "Test State",
                Zip = "12345",
                PhoneNo = "1234567890",
                UserType = userType,
                CreatedAt = DateTime.UtcNow
            };
        }

        public static LoginDto CreateTestLoginDto(string userId = "testuser", string userType = "Patient")
        {
            return new LoginDto
            {
                UserId = userId,
                Password = "Test@123",
                UserType = userType
            };
        }

        public static UserRegistrationDto CreateTestRegistrationDto(string userId = "testuser")
        {
            return new UserRegistrationDto
            {
                FirstName = "Test",
                LastName = "User",
                Gender = "Male",
                Age = 30,
                UserId = userId,
                Password = "Test@123",
                Email = $"{userId}@test.com",
                Address = "123 Test St",
                City = "Test City",
                State = "Test State",
                Zip = "12345",
                PhoneNo = "1234567890",
                UserType = "Patient"
            };
        }
    }
}
