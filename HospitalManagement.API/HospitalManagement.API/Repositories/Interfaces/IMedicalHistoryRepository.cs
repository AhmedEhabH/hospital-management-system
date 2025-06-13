using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Repositories.Interfaces
{
    public interface IMedicalHistoryRepository : IGenericRepository<MedicalHistory>
    {
        Task<IEnumerable<MedicalHistory>> GetByUserIdAsync(int userId);
    }
}
