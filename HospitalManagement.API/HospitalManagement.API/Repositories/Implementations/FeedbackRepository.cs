using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class FeedbackRepository : GenericRepository<Feedback>, IFeedbackRepository
    {
        // FIXED: Add logger parameter to constructor
        public FeedbackRepository(HospitalDbContext context, ILogger<FeedbackRepository> logger)
            : base(context, logger)
        {
        }

        public async Task<IEnumerable<Feedback>> GetByUserIdAsync(int userId)
        {
            try
            {
                return await _dbSet.Where(f => f.UserId == userId).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting feedback for user: {userId}");
                throw;
            }
        }
    }
}
