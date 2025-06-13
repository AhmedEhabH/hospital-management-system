using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class FeedbackRepository : GenericRepository<Feedback>, IFeedbackRepository
    {
        public FeedbackRepository(HospitalDbContext context) : base(context) { }

        public async Task<IEnumerable<Feedback>> GetByUserIdAsync(int userId)
        {
            _logger.Information("Fetching Feedback for UserId: {UserId}", userId);
            return await _context.Feedbacks
                .Where(fb => fb.UserId == userId)
                .ToListAsync();
        }
    }
}