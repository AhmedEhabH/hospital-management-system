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

        //public async Task<int> CountActiveUsersAsync()
        //{
        //    // Example: users who logged in in the last 30 minutes
        //    var since = DateTime.UtcNow.AddMinutes(-30);
        //    return await _context.Users.CountAsync(u => u.LastLogin >= since);
        //}

        //public async Task<int> CountLoginsTodayAsync()
        //{
        //    var today = DateTime.UtcNow.Date;
        //    return await _context.Users.CountAsync(u => u.LastLogin >= today);
        //}

        //public async Task<int> CountRegistrationsThisMonthAsync()
        //{
        //    var firstOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        //    return await _context.Users.CountAsync(u => u.CreatedAt >= firstOfMonth);
        //}

        public async Task<int> CountActiveUsersAsync()
        {
            try
            {
                var since = DateTime.UtcNow.AddMinutes(-30);
                return await _context.Users
                    .CountAsync(u => u.LastLogin.HasValue && u.LastLogin >= since);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error counting active users");
                return 0;
            }
        }

        public async Task<int> CountLoginsTodayAsync()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                return await _context.Users
                    .CountAsync(u => u.LastLogin.HasValue && u.LastLogin >= today);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error counting today's logins");
                return 0;
            }
        }

        public async Task<int> CountRegistrationsThisMonthAsync()
        {
            try
            {
                var firstOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                return await _context.Users.CountAsync(u => u.CreatedAt >= firstOfMonth);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error counting monthly registrations");
                return 0;
            }
        }


    }
}
