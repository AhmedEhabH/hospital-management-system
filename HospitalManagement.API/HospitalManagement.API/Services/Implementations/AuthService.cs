using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace HospitalManagement.API.Services.Implementations
{
    public class AuthService : IAuthService, IDisposable
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;
        private readonly IJwtHelper _jwtHelper;
        private bool _disposed = false;

        public AuthService(
            IUserRepository userRepository,
            IMapper mapper,
            ILogger<AuthService> logger,
            IJwtHelper jwtHelper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _userRepository.GetByUserIdAsync(loginDto.UserId);

                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Login attempt failed for user: {UserId}", loginDto.UserId);
                    return new AuthResultDto
                    {
                        Success = false,
                        Message = "Invalid credentials"
                    };
                }

                if (user.UserType != loginDto.UserType)
                {
                    _logger.LogWarning("User type mismatch for user: {UserId}. Expected: {ExpectedType}, Actual: {ActualType}",
                        loginDto.UserId, loginDto.UserType, user.UserType);
                    return new AuthResultDto
                    {
                        Success = false,
                        Message = "Invalid credentials"
                    };
                }

                var token = _jwtHelper.GenerateToken(user);
                var userInfo = _mapper.Map<UserInfoDto>(user);

                _logger.LogInformation("User logged in successfully: {UserId}", user.UserId);
                return new AuthResultDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    User = userInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for user: {UserId}", loginDto.UserId);
                return new AuthResultDto
                {
                    Success = false,
                    Message = "An unexpected error occurred during login"
                };
            }
        }

        public async Task<RegistrationResultDto> RegisterAsync(UserRegistrationDto registrationDto)
        {
            try
            {
                // Check if user already exists
                if (await _userRepository.UserExistsAsync(registrationDto.Email))
                {
                    _logger.LogWarning("Registration attempt with existing email: {Email}", registrationDto.Email);
                    return new RegistrationResultDto
                    {
                        Success = false,
                        Message = "User with this email already exists."
                    };
                }

                if (await _userRepository.UserIdExistsAsync(registrationDto.UserId))
                {
                    _logger.LogWarning("Registration attempt with existing user ID: {UserId}", registrationDto.UserId);
                    return new RegistrationResultDto
                    {
                        Success = false,
                        Message = "User ID already exists."
                    };
                }

                // Create new user
                var user = _mapper.Map<User>(registrationDto);
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password);
                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;

                var createdUser = await _userRepository.AddAsync(user);

                _logger.LogInformation("User registered successfully: {Email}", createdUser.Email);

                return new RegistrationResultDto
                {
                    Success = true,
                    Message = "User registered successfully.",
                    UserId = createdUser.Id
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration for email: {Email}", registrationDto.Email);
                return new RegistrationResultDto
                {
                    Success = false,
                    Message = "An unexpected error occurred during registration"
                };
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // Dispose managed resources if any
                }
                _disposed = true;
            }
        }
    }
}
