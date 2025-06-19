using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Repositories.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByUserIdAsync(string userId);

        // FIXED: Add missing methods
        Task<bool> UserExistsAsync(string email);
        Task<bool> UserIdExistsAsync(string userId);
    }
}
