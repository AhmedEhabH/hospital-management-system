using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IJwtHelper
    {
        string GenerateToken(User user);
        bool ValidateToken(string token);
        int? GetUserIdFromToken(string token);
        string? GetUserTypeFromToken(string token);
    }
}
