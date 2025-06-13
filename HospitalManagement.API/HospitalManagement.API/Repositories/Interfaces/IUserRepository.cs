using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Repositories.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByUserIdAsync(string userId);
        Task<User?> GetByEmailAsync(string email);
    }
}
