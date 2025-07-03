using HospitalManagement.API.Models.Entities;
using System.Linq.Expressions;

namespace HospitalManagement.API.Repositories.Interfaces
{
    public interface IAppointmentRepository : IGenericRepository<Appointment>
    {
        Task<IEnumerable<Appointment>> GetAppointmentsForDoctorInRange(int doctorId, DateTime startDate, DateTime endDate);
        Task<bool> IsSlotAvailable(int doctorId, DateTime startTime, DateTime endTime);

        // FIXED: Add the missing method that inherits from IGenericRepository
        // This method should already be inherited from IGenericRepository<Appointment>
        // but let's ensure it's explicitly available
    }
}
