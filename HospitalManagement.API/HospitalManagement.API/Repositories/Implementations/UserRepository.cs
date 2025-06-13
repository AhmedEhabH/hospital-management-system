using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(HospitalDbContext context) : base(context) { }

        public async Task<User?> GetByUserIdAsync(string userId)
        {
            _logger.Information("Fetching User by UserId: {UserId}", userId);
            return await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            _logger.Information("Fetching User by Email: {Email}", email);
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
