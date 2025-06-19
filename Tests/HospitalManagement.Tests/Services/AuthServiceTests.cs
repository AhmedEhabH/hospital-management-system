using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Implementations;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Serilog;
using Xunit;

namespace HospitalManagement.Tests.Services
{
    public class AuthServiceTests : IDisposable
    {
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<AuthService>> _mockLogger;
        private readonly Mock<IJwtHelper> _mockJwtHelper;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _mockUserRepository = new Mock<IUserRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<AuthService>>();
            _mockJwtHelper = new Mock<IJwtHelper>();

            // FIXED: Add IJwtHelper parameter
            _authService = new AuthService(
                _mockUserRepository.Object,
                _mockMapper.Object,
                _mockLogger.Object,
                _mockJwtHelper.Object
            );
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsSuccessResult()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                UserId = "test001",
                Password = "password123",
                UserType = "Patient"
            };
            var user = new User
            {
                Id = 1,
                UserId = "test001",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                UserType = "Patient",
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com"
            };
            var userInfoDto = new UserInfoDto
            {
                Id = 1,
                UserId = "test001",
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                UserType = "Patient"
            };

            _mockUserRepository.Setup(r => r.GetByUserIdAsync(loginDto.UserId))
                              .ReturnsAsync(user);
            _mockMapper.Setup(m => m.Map<UserInfoDto>(user))
                      .Returns(userInfoDto);
            _mockJwtHelper.Setup(j => j.GenerateToken(user))
                         .Returns("mock-jwt-token");

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(result.Token);
            Assert.NotNull(result.User);
        }

        [Fact]
        public async Task LoginAsync_InvalidCredentials_ReturnsFailureResult()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                UserId = "test001",
                Password = "wrongpassword",
                UserType = "Patient"
            };

            // FIXED: Use proper null handling
            _mockUserRepository.Setup(r => r.GetByUserIdAsync(loginDto.UserId))
                              .ReturnsAsync((User?)null);

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Invalid credentials", result.Message);
        }

        [Fact]
        public async Task RegisterAsync_NewUser_ReturnsSuccessResult()
        {
            // Arrange
            var registrationDto = new UserRegistrationDto
            {
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                UserId = "test001",
                Password = "password123",
                UserType = "Patient",
                Gender = "Male",
                Age = 30,
                Address = "Test Address",
                City = "Test City",
                State = "Test State",
                Zip = "12345",
                PhoneNo = "1234567890"
            };
            var user = new User
            {
                Id = 1,
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                UserId = "test001",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                UserType = "Patient"
            };

            _mockUserRepository.Setup(r => r.UserExistsAsync(registrationDto.Email))
                              .ReturnsAsync(false);
            _mockUserRepository.Setup(r => r.UserIdExistsAsync(registrationDto.UserId))
                              .ReturnsAsync(false);
            _mockMapper.Setup(m => m.Map<User>(registrationDto))
                      .Returns(user);
            _mockUserRepository.Setup(r => r.AddAsync(It.IsAny<User>()))
                              .ReturnsAsync(user);

            // Act
            var result = await _authService.RegisterAsync(registrationDto);

            // Assert
            Assert.True(result.Success);
            Assert.Equal("User registered successfully.", result.Message);
        }

        public void Dispose()
        {
            // Clean up resources if needed
            Log.Information("Disposing AuthService unit tests");
        }
    }
}
