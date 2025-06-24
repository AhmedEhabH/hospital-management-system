using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetSystemStatsAsync();
        Task<PatientDashboardDto?> GetPatientDashboardAsync(int patientId);
        Task<DoctorDashboardDto?> GetDoctorDashboardAsync(int doctorId);

        Task<List<UserActivityDto>> GetRecentUserActivitiesAsync(int limit = 20);
    }
}
