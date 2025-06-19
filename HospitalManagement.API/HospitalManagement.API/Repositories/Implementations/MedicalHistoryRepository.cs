using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class MedicalHistoryRepository : GenericRepository<MedicalHistory>, IMedicalHistoryRepository
    {
        public MedicalHistoryRepository(HospitalDbContext context, ILogger<MedicalHistoryRepository> logger)
            : base(context, logger)
        {
        }

        public async Task<IEnumerable<MedicalHistory>> GetByUserIdAsync(int userId)
        {
            try
            {
                return await _dbSet.Where(mh => mh.UserId == userId).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting medical history for user: {userId}");
                throw;
            }
        }
    }
}
