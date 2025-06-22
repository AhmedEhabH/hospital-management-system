using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(HospitalDbContext context, ILogger<UserRepository> logger)
            : base(context, logger)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            try
            {
                return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting user by email: {email}");
                throw;
            }
        }

        public async Task<User?> GetByUserIdAsync(string userId)
        {
            try
            {
                return await _dbSet.FirstOrDefaultAsync(u => u.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting user by userId: {userId}");
                throw;
            }
        }

        public async Task<bool> UserExistsAsync(string email)
        {
            try
            {
                return await _dbSet.AnyAsync(u => u.Email == email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if user exists: {email}");
                throw;
            }
        }

        public async Task<bool> UserIdExistsAsync(string userId)
        {
            try
            {
                return await _dbSet.AnyAsync(u => u.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if userId exists: {userId}");
                throw;
            }
        }

        public async Task<int> CountByUserTypeAsync(string userType)
        {
            return await _context.Users.CountAsync(u => u.UserType == userType);
        }

    }
}
