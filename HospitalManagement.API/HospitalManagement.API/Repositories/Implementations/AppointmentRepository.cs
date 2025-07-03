using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
    {
        //private readonly HospitalDbContext _context;
        //protected readonly ILogger<AppointmentRepository> _logger;

        public AppointmentRepository(HospitalDbContext context, ILogger<AppointmentRepository> logger) : base(context, logger)
        {
            //_context = context;
            //_logger = logger;
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsForDoctorInRange(int doctorId, DateTime startDate, DateTime endDate)
        {
            return await _context.Appointments
                .Where(a => a.DoctorId == doctorId && a.StartTime >= startDate && a.StartTime < endDate && a.Status != "Cancelled")
                .Include(a => a.Patient) // Include patient details for the DTO
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<bool> IsSlotAvailable(int doctorId, DateTime startTime, DateTime endTime)
        {
            // Check for any overlapping appointments that are not cancelled
            var isOverlapping = await _context.Appointments
                .AnyAsync(a => a.DoctorId == doctorId &&
                               a.Status != "Cancelled" &&
                               a.StartTime < endTime && a.EndTime > startTime);

            return !isOverlapping;
        }
    }
}
