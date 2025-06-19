using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IMedicalHistoryService
    {
        // FIXED: Match method names and return types with implementation
        Task<MedicalHistoryDto> CreateMedicalHistoryAsync(MedicalHistoryDto medicalHistoryDto);
        Task<MedicalHistoryDto?> GetMedicalHistoryByIdAsync(int id);
        Task<IEnumerable<MedicalHistoryDto>> GetMedicalHistoryByUserIdAsync(int userId);
        Task UpdateMedicalHistoryAsync(MedicalHistoryDto medicalHistoryDto);
        Task DeleteMedicalHistoryAsync(int id);
    }
}
