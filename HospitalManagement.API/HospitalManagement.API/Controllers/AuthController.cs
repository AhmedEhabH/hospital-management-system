using Microsoft.AspNetCore.Mvc;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResultDto>> Login(LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new AuthResultDto
                    {
                        Success = false,
                        Message = "Invalid input data"
                    });
                }

                var result = await _authService.LoginAsync(loginDto);

                if (!result.Success)
                {
                    return Ok(result); // Return 200 with success: false for invalid credentials
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in login endpoint");
                return StatusCode(500, new AuthResultDto
                {
                    Success = false,
                    Message = "An unexpected error occurred"
                });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegistrationResultDto>> Register(UserRegistrationDto registrationDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new RegistrationResultDto
                    {
                        Success = false,
                        Message = "Invalid input data"
                    });
                }

                var result = await _authService.RegisterAsync(registrationDto);

                if (!result.Success)
                {
                    return Ok(result); // Return 200 with success: false for registration errors
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in register endpoint");
                return StatusCode(500, new RegistrationResultDto
                {
                    Success = false,
                    Message = "An unexpected error occurred"
                });
            }
        }
    }
}
