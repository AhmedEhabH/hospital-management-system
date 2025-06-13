using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Utilities;
using AutoMapper;
using Serilog;

namespace HospitalManagement.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IJwtHelper _jwtHelper;
        private readonly Serilog.ILogger _logger;

        public AuthService(
            IUserRepository userRepository,
            IMapper mapper,
            IJwtHelper jwtHelper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _jwtHelper = jwtHelper;
            _logger = Log.ForContext<AuthService>();
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto loginDto)
        {
            _logger.Information("Login attempt for UserId: {UserId}", loginDto.UserId);
            var user = await _userRepository.GetByUserIdAsync(loginDto.UserId);
            if (user == null || !PasswordHelper.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                _logger.Warning("Invalid login for UserId: {UserId}", loginDto.UserId);
                return new AuthResultDto { Success = false, Message = "Invalid credentials." };
            }

            var token = _jwtHelper.GenerateToken(user);
            _logger.Information("Login successful for UserId: {UserId}", loginDto.UserId);

            return new AuthResultDto
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                User = _mapper.Map<UserInfoDto>(user)
            };
        }

        public async Task<RegistrationResultDto> RegisterAsync(UserRegistrationDto registrationDto)
        {
            _logger.Information("Registration attempt for Email: {Email}", registrationDto.Email);

            if (await _userRepository.GetByEmailAsync(registrationDto.Email) != null)
            {
                _logger.Warning("Registration failed: Email already exists ({Email})", registrationDto.Email);
                return new RegistrationResultDto { Success = false, Message = "Email already exists." };
            }

            if (await _userRepository.GetByUserIdAsync(registrationDto.UserId) != null)
            {
                _logger.Warning("Registration failed: UserId already exists ({UserId})", registrationDto.UserId);
                return new RegistrationResultDto { Success = false, Message = "UserId already exists." };
            }

            var user = _mapper.Map<User>(registrationDto);
            user.PasswordHash = PasswordHelper.HashPassword(registrationDto.Password);

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            _logger.Information("Registration successful for UserId: {UserId}", user.UserId);

            return new RegistrationResultDto
            {
                Success = true,
                Message = "Registration successful.",
                UserId = user.Id
            };
        }
    }
}