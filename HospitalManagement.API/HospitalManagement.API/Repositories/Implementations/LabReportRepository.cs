using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class LabReportRepository : GenericRepository<LabReport>, ILabReportRepository
    {
        public LabReportRepository(HospitalDbContext context) : base(context) { }

        public async Task<IEnumerable<LabReport>> GetByPatientIdAsync(int patientId)
        {
            _logger.Information("Fetching LabReports for PatientId: {PatientId}", patientId);
            return await _context.LabReports
                .Where(lr => lr.PatientId == patientId)
                .ToListAsync();
        }
    }
}