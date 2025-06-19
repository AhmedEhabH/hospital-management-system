using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IHospitalService
    {
        // FIXED: Match method names with implementation
        Task<HospitalInfoDto> CreateHospitalInfoAsync(HospitalInfoDto hospitalInfoDto);
        Task<HospitalInfoDto?> GetHospitalInfoByIdAsync(int id);
        Task<IEnumerable<HospitalInfoDto>> GetAllHospitalInfoAsync();
        Task UpdateHospitalInfoAsync(HospitalInfoDto hospitalInfoDto);
        Task DeleteHospitalInfoAsync(int id);
    }
}
