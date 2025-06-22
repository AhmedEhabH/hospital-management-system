using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface ILabReportService
    {
        // FIXED: Match method names and return types with implementation
        Task<LabReportDto> CreateLabReportAsync(LabReportDto labReportDto);
        Task<LabReportDto?> GetLabReportByIdAsync(int id);
        Task<IEnumerable<LabReportDto>> GetLabReportsByPatientIdAsync(int patientId);
        Task UpdateLabReportAsync(LabReportDto labReportDto);
        Task DeleteLabReportAsync(int id);

        Task<IEnumerable<LabReportDto>> GetCriticalLabReportsAsync();

    }
}
