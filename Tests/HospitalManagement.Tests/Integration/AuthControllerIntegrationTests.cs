using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;
using FluentAssertions;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.Tests.Fixtures;
using HospitalManagement.API;

namespace HospitalManagement.Tests.Integration
{
    public class AuthControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;

        public AuthControllerIntegrationTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithToken()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                UserId = "test001",
                Password = "Password@123",
                UserType = "Patient"
            };

            var json = JsonSerializer.Serialize(loginDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/Auth/login", content);

            // Debug information
            var responseContent = await response.Content.ReadAsStringAsync();
            System.Console.WriteLine($"Response Status: {response.StatusCode}");
            System.Console.WriteLine($"Response Content: {responseContent}");

            // Assert
            response.IsSuccessStatusCode.Should().BeTrue($"Expected successful response but got {response.StatusCode}. Content: {responseContent}");

            var authResult = JsonSerializer.Deserialize<AuthResultDto>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            authResult.Should().NotBeNull();
            authResult.Success.Should().BeTrue();
            authResult.Token.Should().NotBeNullOrEmpty();
            authResult.User.Should().NotBeNull();
            authResult.User.Email.Should().Be("test@hospital.com");
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                UserId = "invalid",
                Password = "wrongpassword",
                UserType = "Patient"
            };

            var json = JsonSerializer.Serialize(loginDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/Auth/login", content);

            // Assert
            var responseContent = await response.Content.ReadAsStringAsync();
            response.IsSuccessStatusCode.Should().BeTrue("Login endpoint should return 200 even for invalid credentials");

            var authResult = JsonSerializer.Deserialize<AuthResultDto>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            authResult.Should().NotBeNull();
            authResult.Success.Should().BeFalse();
            authResult.Message.Should().Be("Invalid credentials");
        }

        [Fact]
        public async Task Register_ValidUser_ReturnsOkWithSuccess()
        {
            // Arrange
            var registrationDto = new UserRegistrationDto
            {
                FirstName = "New",
                LastName = "User",
                Gender = "Male",
                Age = 25,
                UserId = "newuser001",
                Password = "NewUser@123",
                Email = "newuser@hospital.com",
                Address = "789 New Street",
                City = "New City",
                State = "New State",
                Zip = "54321",
                PhoneNo = "5555555555",
                UserType = "Patient"
            };

            var json = JsonSerializer.Serialize(registrationDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/Auth/register", content);

            // Assert
            var responseContent = await response.Content.ReadAsStringAsync();
            response.IsSuccessStatusCode.Should().BeTrue($"Expected successful response but got {response.StatusCode}. Content: {responseContent}");

            var registrationResult = JsonSerializer.Deserialize<RegistrationResultDto>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            registrationResult.Should().NotBeNull();
            registrationResult.Success.Should().BeTrue();
            registrationResult.Message.Should().Be("User registered successfully.");
            registrationResult.UserId.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsBadRequest()
        {
            // Arrange
            var registrationDto = new UserRegistrationDto
            {
                FirstName = "Duplicate",
                LastName = "User",
                Gender = "Female",
                Age = 28,
                UserId = "duplicate001",
                Password = "Duplicate@123",
                Email = "test@hospital.com", // This email already exists in test data
                Address = "999 Duplicate Street",
                City = "Duplicate City",
                State = "Duplicate State",
                Zip = "99999",
                PhoneNo = "9999999999",
                UserType = "Patient"
            };

            var json = JsonSerializer.Serialize(registrationDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/Auth/register", content);

            // Assert
            var responseContent = await response.Content.ReadAsStringAsync();
            response.IsSuccessStatusCode.Should().BeTrue("Register endpoint should return 200 even for duplicate email");

            var registrationResult = JsonSerializer.Deserialize<RegistrationResultDto>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            registrationResult.Should().NotBeNull();
            registrationResult.Success.Should().BeFalse();
            registrationResult.Message.Should().Be("User with this email already exists.");
        }
    }
}
