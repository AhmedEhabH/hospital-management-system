using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IMedicalHistoryService
    {
        Task<IEnumerable<MedicalHistoryDto>> GetMedicalHistoriesByUserIdAsync(int userId);
        Task<MedicalHistoryDto?> GetMedicalHistoryByIdAsync(int id);
        Task<MedicalHistoryDto> AddMedicalHistoryAsync(MedicalHistoryDto dto);
        Task<bool> UpdateMedicalHistoryAsync(int id, MedicalHistoryDto dto);
        Task<bool> DeleteMedicalHistoryAsync(int id);
    }
}
