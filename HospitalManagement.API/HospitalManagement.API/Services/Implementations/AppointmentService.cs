﻿// FIXED: Add using directive for the repository interface
using AutoMapper;
using Hangfire;
using HospitalManagement.API.Hubs;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace HospitalManagement.API.Services.Implementations
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUserRepository _userRepository; // Assuming you have an IUserRepository
        private readonly IMapper _mapper;
        private readonly ILogger<AppointmentService> _logger;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<MedicalAlertsHub> _hubContext;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IUserRepository userRepository,
            IMapper mapper,
            ILogger<AppointmentService> logger,
            IHubContext<MedicalAlertsHub> hubContext,
            INotificationService notificationService
            )
        {
            _appointmentRepository = appointmentRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _logger = logger;
            _hubContext = hubContext;
            _notificationService = notificationService;
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

            try
            {
                // Send immediate confirmation email
                BackgroundJob.Enqueue<INotificationService>(
                    service => service.SendAppointmentConfirmationEmailAsync(appointment.Id));

                // Schedule reminder email 24 hours before appointment
                var reminderTime = appointment.StartTime.AddHours(-24);
                if (reminderTime > DateTime.UtcNow)
                {
                    var reminderJobId = _notificationService.ScheduleAppointmentReminder(appointment.Id, reminderTime);
                    _logger.LogInformation("Scheduled appointment reminder job {JobId} for appointment {AppointmentId}",
                        reminderJobId, appointment.Id);
                }

                _logger.LogInformation("Background jobs scheduled successfully for appointment {AppointmentId}", appointment.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling background jobs for appointment {AppointmentId}", appointment.Id);
                // Don't fail the appointment creation if background jobs fail
            }

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
