using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Utilities
{
    public interface IJwtHelper
    {
        string GenerateToken(User user);
    }
}
