using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace HospitalManagement.Tests.Helpers
{
    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string AuthenticationScheme = "Test";

        public TestAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock
            )
            : base(options, logger, encoder, clock)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Name, "Test User"),
                new Claim(ClaimTypes.Email, "test@hospital.com"),
                new Claim("UserType", "Patient")
            };

            // Check if a specific user ID is provided in the request headers
            if (Context.Request.Headers.TryGetValue("Test-User-Id", out var userId))
            {
                claims.RemoveAll(c => c.Type == ClaimTypes.NameIdentifier);
                claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
            }

            // Check if a specific user type is provided in the request headers
            if (Context.Request.Headers.TryGetValue("Test-User-Type", out var userType))
            {
                claims.RemoveAll(c => c.Type == "UserType");
                claims.Add(new Claim("UserType", userType.ToString()));
            }

            var identity = new ClaimsIdentity(claims, AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, AuthenticationScheme);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
