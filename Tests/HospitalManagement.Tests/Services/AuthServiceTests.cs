using Xunit;
using Moq;
using AutoMapper;
using FluentAssertions;
using HospitalManagement.API.Services.Implementations;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Utilities;
using Serilog;

namespace HospitalManagement.Tests.Services
{
    public class AuthServiceTests : IDisposable
    {
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IJwtHelper> _mockJwtHelper; // Interface mock - no constructor args
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            Log.Information("Setting up AuthService unit tests");

            _mockUserRepository = new Mock<IUserRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockJwtHelper = new Mock<IJwtHelper>(); // Remove constructor arguments

            _authService = new AuthService(
                _mockUserRepository.Object,
                _mockMapper.Object,
                _mockJwtHelper.Object);
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsSuccessResult()
        {
            // Arrange
            Log.Information("Testing LoginAsync with valid credentials");

            var loginDto = new LoginDto
            {
                UserId = "testuser",
                Password = "Test@123",
                UserType = "Patient"
            };

            var user = new User
            {
                Id = 1,
                UserId = "testuser",
                PasswordHash = PasswordHelper.HashPassword("Test@123"),
                UserType = "Patient",
                Email = "test@test.com",
                FirstName = "Test",
                LastName = "User"
            };

            var userInfoDto = new UserInfoDto
            {
                Id = 1,
                UserId = "testuser",
                Email = "test@test.com",
                FirstName = "Test",
                LastName = "User",
                UserType = "Patient"
            };

            _mockUserRepository.Setup(r => r.GetByUserIdAsync("testuser"))
                .ReturnsAsync(user);
            _mockMapper.Setup(m => m.Map<UserInfoDto>(user))
                .Returns(userInfoDto);
            _mockJwtHelper.Setup(j => j.GenerateToken(user))
                .Returns("fake-jwt-token");

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Message.Should().Be("Login successful.");
            result.Token.Should().NotBeNullOrEmpty();
            result.User.Should().NotBeNull();
            result.User.UserId.Should().Be("testuser");

            Log.Information("LoginAsync test with valid credentials completed successfully");
        }

        [Fact]
        public async Task LoginAsync_InvalidCredentials_ReturnsFailureResult()
        {
            // Arrange
            Log.Information("Testing LoginAsync with invalid credentials");

            var loginDto = new LoginDto
            {
                UserId = "testuser",
                Password = "WrongPassword",
                UserType = "Patient"
            };

            _mockUserRepository.Setup(r => r.GetByUserIdAsync("testuser"))
                .ReturnsAsync((User)null!);

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Invalid credentials.");
            result.Token.Should().BeNull();

            Log.Information("LoginAsync test with invalid credentials completed successfully");
        }

        [Fact]
        public async Task RegisterAsync_NewUser_ReturnsSuccessResult()
        {
            // Arrange
            Log.Information("Testing RegisterAsync with new user");

            var registrationDto = new UserRegistrationDto
            {
                FirstName = "New",
                LastName = "User",
                Gender = "Male",
                Age = 25,
                UserId = "newuser",
                Password = "NewUser@123",
                Email = "newuser@test.com",
                Address = "123 New St",
                City = "New City",
                State = "New State",
                Zip = "54321",
                PhoneNo = "5555555555",
                UserType = "Patient"
            };

            var user = new User
            {
                Id = 3,
                FirstName = "New",
                LastName = "User",
                UserId = "newuser",
                Email = "newuser@test.com",
                UserType = "Patient"
            };

            _mockUserRepository.Setup(r => r.GetByEmailAsync("newuser@test.com"))
                .ReturnsAsync((User)null!);
            _mockUserRepository.Setup(r => r.GetByUserIdAsync("newuser"))
                .ReturnsAsync((User)null!);
            _mockMapper.Setup(m => m.Map<User>(registrationDto))
                .Returns(user);
            _mockUserRepository.Setup(r => r.AddAsync(It.IsAny<User>()))
                .Returns(Task.CompletedTask);
            _mockUserRepository.Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(1);

            // Act
            var result = await _authService.RegisterAsync(registrationDto);

            // Assert
            result.Should().NotBeNull();
            result.Success.Should().BeTrue();
            result.Message.Should().Be("Registration successful.");
            result.UserId.Should().Be(3);

            Log.Information("RegisterAsync test with new user completed successfully");
        }

        public void Dispose()
        {
            Log.Information("Disposing AuthService unit tests");
        }
    }
}
