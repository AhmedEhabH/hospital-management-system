using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class LabReportRepository : GenericRepository<LabReport>, ILabReportRepository
    {
        // FIXED: Add logger parameter to constructor
        public LabReportRepository(HospitalDbContext context, ILogger<LabReportRepository> logger)
            : base(context, logger)
        {
        }

        public async Task<IEnumerable<LabReport>> GetByPatientIdAsync(int patientId)
        {
            try
            {
                return await _dbSet.Where(lr => lr.PatientId == patientId).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting lab reports for patient: {patientId}");
                throw;
            }
        }
    }
}
