using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface ILabReportService
    {
        Task<IEnumerable<LabReportDto>> GetLabReportsByPatientIdAsync(int patientId);
        Task<LabReportDto?> GetLabReportByIdAsync(int id);
        Task<LabReportDto> AddLabReportAsync(LabReportDto dto);
        Task<bool> UpdateLabReportAsync(int id, LabReportDto dto);
        Task<bool> DeleteLabReportAsync(int id);
    }
}
