using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HospitalManagement.API.Models.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Serilog;

namespace HospitalManagement.API.Utilities
{
    public class JwtHelper : IJwtHelper
    {
        private readonly IConfiguration _configuration;
        private readonly Serilog.ILogger _logger;

        public JwtHelper(IConfiguration configuration)
        {
            _configuration = configuration;
            _logger = Log.ForContext<JwtHelper>();
        }

        public string GenerateToken(User user)
        {
            _logger.Information("Generating JWT token for user: {UserId}", user.UserId);

            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"];
                var issuer = jwtSettings["Issuer"];
                var audience = jwtSettings["Audience"];
                var expiryMinutes = int.Parse(jwtSettings["ExpiryInMinutes"] ?? "60");

                // Add validation for secret key
                if (string.IsNullOrEmpty(secretKey))
                {
                    _logger.Error("JWT secret key is null or empty. Check appsettings.json configuration.");
                    throw new InvalidOperationException("JWT secret key is not configured properly.");
                }

                if (secretKey.Length < 32)
                {
                    _logger.Error("JWT secret key is too short. Must be at least 32 characters.");
                    throw new InvalidOperationException("JWT secret key must be at least 32 characters long.");
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
                var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.UserId),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.UserType),
                    new Claim("FirstName", user.FirstName),
                    new Claim("LastName", user.LastName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
                };

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                    signingCredentials: credentials
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                _logger.Information("JWT token generated successfully for user: {UserId}", user.UserId);

                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error generating JWT token for user: {UserId}", user.UserId);
                throw;
            }
        }
    }
}
