using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Repositories.Interfaces
{
    public interface ILabReportRepository : IGenericRepository<LabReport>
    {
        Task<IEnumerable<LabReport>> GetByPatientIdAsync(int patientId);

        Task<int> GetTotalCountAsync();
        Task<int> GetCriticalCountAsync();
        Task<IEnumerable<LabReport>> GetCriticalAsync();

    }
}