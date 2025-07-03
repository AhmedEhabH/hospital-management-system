// FIXED: Add using directive for the repository interface
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using AutoMapper;

namespace HospitalManagement.API.Services.Implementations
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository; // Assuming you have an IUserRepository
        private readonly IMapper _mapper;
        private readonly ILogger<AppointmentService> _logger;

        public AppointmentService(IAppointmentRepository appointmentRepository, IUserRepository userRepository, IMapper mapper, ILogger<AppointmentService> logger)
        {
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<AppointmentDto> GetAppointmentByIdAsync(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            return _mapper.Map<AppointmentDto>(appointment);
        }

        public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByDoctorAsync(int doctorId, DateTime startDate, DateTime endDate)
        {
            var appointments = await _appointmentRepository.GetAppointmentsForDoctorInRange(doctorId, startDate, endDate);
            return _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
        }

        public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByPatientAsync(int patientId)
        {
            var appointments = await _appointmentRepository.GetByConditionAsync(a => a.PatientId == patientId);
            return _mapper.Map<IEnumerable<AppointmentDto>>(appointments);
        }

        public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto createAppointmentDto)
        {
            var appointment = _mapper.Map<Appointment>(createAppointmentDto);

            // Set EndTime and default status
            appointment.EndTime = appointment.StartTime.AddMinutes(createAppointmentDto.DurationInMinutes);
            appointment.Status = "Scheduled";

            // Check for scheduling conflicts before adding
            if (!await _appointmentRepository.IsSlotAvailable(appointment.DoctorId, appointment.StartTime, appointment.EndTime))
            {
                _logger.LogWarning("Attempted to book an unavailable slot for Doctor ID {DoctorId} at {StartTime}", appointment.DoctorId, appointment.StartTime);
                return null!;
            }

            await _appointmentRepository.AddAsync(appointment);
            await _appointmentRepository.SaveChangesAsync();

            _logger.LogInformation("Successfully created appointment {AppointmentId}", appointment.Id);

            // Fetch related data to populate the full DTO for the response
            var createdDto = _mapper.Map<AppointmentDto>(appointment);
            var doctor = await _userRepository.GetByIdAsync(appointment.DoctorId);
            var patient = await _userRepository.GetByIdAsync(appointment.PatientId);
            createdDto.DoctorName = $"{doctor?.FirstName} {doctor?.LastName}";
            createdDto.PatientName = $"{patient?.FirstName} {patient?.LastName}";

            return createdDto;
        }

        public async Task<DoctorAvailabilityDto> GetDoctorAvailabilityAsync(int doctorId, DateTime date)
        {
            var availability = new DoctorAvailabilityDto { DoctorId = doctorId };
            var workingHoursStart = 9; // 9 AM
            var workingHoursEnd = 17; // 5 PM
            var slotDuration = 30; // minutes

            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1);
            var bookedAppointments = await _appointmentRepository.GetAppointmentsForDoctorInRange(doctorId, dayStart, dayEnd);

            for (var time = dayStart.AddHours(workingHoursStart); time < dayStart.AddHours(workingHoursEnd); time = time.AddMinutes(slotDuration))
            {
                var slotStart = time;
                var slotEnd = time.AddMinutes(slotDuration);

                bool isBooked = bookedAppointments.Any(a => slotStart < a.EndTime && slotEnd > a.StartTime);

                if (!isBooked)
                {
                    availability.AvailableSlots.Add(new TimeSlot { StartTime = slotStart, EndTime = slotEnd });
                }
            }
            return availability;
        }
    }
}
