using Hangfire.Dashboard;

namespace HospitalManagement.API.Utilities
{
    /// <summary>
    /// Authorization filter for Hangfire Dashboard
    /// In production, implement proper authentication
    /// </summary>
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            // In development, allow all access
            // In production, implement proper authentication:
            // - Check if user is authenticated
            // - Check if user has admin role
            // - Validate JWT token

            return true; // For development only

            // Production implementation example:
            // var httpContext = context.GetHttpContext();
            // return httpContext.User.Identity.IsAuthenticated && 
            //        httpContext.User.IsInRole("Admin");
        }
    }
}
