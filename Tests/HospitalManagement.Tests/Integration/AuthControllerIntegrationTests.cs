using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Xunit;
using FluentAssertions;
using HospitalManagement.API.Data;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.Tests.Fixtures;
using Serilog;

namespace HospitalManagement.Tests.Integration
{
    public class AuthControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public AuthControllerIntegrationTests(CustomWebApplicationFactory<Program> factory)
        {
            Log.Information("Setting up AuthController integration tests");
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithToken()
        {
            // Arrange
            Log.Information("Testing Login endpoint with valid credentials");

            await SeedTestUser();

            var loginDto = new LoginDto
            {
                UserId = "testuser",
                Password = "Test@123",
                UserType = "Patient"
            };

            var json = JsonSerializer.Serialize(loginDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/auth/login", content);

            // Assert
            response.Should().NotBeNull();
            response.IsSuccessStatusCode.Should().BeTrue();

            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<AuthResultDto>(responseString,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Token.Should().NotBeNullOrEmpty();

            Log.Information("Login integration test completed successfully");
        }

        private async Task SeedTestUser()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();

            if (!await context.Users.AnyAsync(u => u.UserId == "testuser"))
            {
                var testUser = new HospitalManagement.API.Models.Entities.User
                {
                    FirstName = "Test",
                    LastName = "User",
                    Gender = "Male",
                    Age = 30,
                    UserId = "testuser",
                    PasswordHash = HospitalManagement.API.Utilities.PasswordHelper.HashPassword("Test@123"),
                    Email = "testuser@test.com",
                    Address = "123 Test St",
                    City = "Test City",
                    State = "Test State",
                    Zip = "12345",
                    PhoneNo = "1234567890",
                    UserType = "Patient",
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(testUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
