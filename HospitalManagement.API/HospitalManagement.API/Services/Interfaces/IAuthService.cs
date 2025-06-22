using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResultDto> LoginAsync(LoginDto loginDto);
        Task<RegistrationResultDto> RegisterAsync(UserRegistrationDto registrationDto);

        Task<UserInfoDto?> GetUserByIdAsync(int id);

    }
}
