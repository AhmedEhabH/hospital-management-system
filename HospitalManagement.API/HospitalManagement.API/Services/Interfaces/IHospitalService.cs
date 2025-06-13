using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IHospitalService
    {
        Task<IEnumerable<HospitalInfoDto>> GetAllHospitalInfosAsync();
        Task<HospitalInfoDto?> GetHospitalInfoByIdAsync(int id);
        Task<HospitalInfoDto> AddHospitalInfoAsync(HospitalInfoDto dto);
        Task<bool> UpdateHospitalInfoAsync(int id, HospitalInfoDto dto);
        Task<bool> DeleteHospitalInfoAsync(int id);
    }
}
