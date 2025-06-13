using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly Serilog.ILogger _logger;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
            _logger = Log.ForContext<AuthController>();
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResultDto>> Login([FromBody] LoginDto loginDto)
        {
            _logger.Information("POST login attempt for UserId: {UserId}", loginDto.UserId);
            var result = await _authService.LoginAsync(loginDto);
            if (!result.Success)
            {
                _logger.Warning("Login failed for UserId: {UserId}", loginDto.UserId);
                return Unauthorized(result);
            }
            return Ok(result);
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<RegistrationResultDto>> Register([FromBody] UserRegistrationDto registrationDto)
        {
            _logger.Information("POST registration attempt for Email: {Email}", registrationDto.Email);
            var result = await _authService.RegisterAsync(registrationDto);
            if (!result.Success)
            {
                _logger.Warning("Registration failed for Email: {Email}", registrationDto.Email);
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}
