using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class MedicalHistoryRepository : GenericRepository<MedicalHistory>, IMedicalHistoryRepository
    {
        public MedicalHistoryRepository(HospitalDbContext context) : base(context) { }

        public async Task<IEnumerable<MedicalHistory>> GetByUserIdAsync(int userId)
        {
            _logger.Information("Fetching MedicalHistories for UserId: {UserId}", userId);
            return await _context.MedicalHistories
                .Where(mh => mh.UserId == userId)
                .ToListAsync();
        }
    }
}
