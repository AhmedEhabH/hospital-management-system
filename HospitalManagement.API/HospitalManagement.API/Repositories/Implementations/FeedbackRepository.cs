using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class FeedbackRepository : GenericRepository<Feedback>, IFeedbackRepository
    {
        public FeedbackRepository(HospitalDbContext context, ILogger<FeedbackRepository> logger) : base(context, logger)
        {
        }

        public async Task<IEnumerable<Feedback>> GetByUserIdAsync(int userId)
        {
            return await _context.Feedbacks
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetRecentCountAsync(int days)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            return await _context.Feedbacks
                .CountAsync(f => f.CreatedAt >= cutoffDate);
        }
    }
}
