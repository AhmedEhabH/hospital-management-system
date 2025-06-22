using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        /// <summary>
        /// Get user information by ID
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User information</returns>
        [HttpGet("user/{id}")]
        [Authorize]
        public async Task<ActionResult<UserInfoDto>> GetUserById(int id)
        {
            try
            {
                _logger.LogInformation("Fetching user information for ID: {UserId}", id);
                var user = await _authService.GetUserByIdAsync(id);

                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching user with ID: {UserId}", id);
                return StatusCode(500, "Internal server error occurred while fetching user information");
            }
        }

    }
}
