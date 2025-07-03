using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HospitalManagement.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(IAppointmentService appointmentService, ILogger<AppointmentsController> logger)
        {
            _appointmentService = appointmentService;
            _logger = logger;
        }

        // GET: api/appointments/doctor/{doctorId}
        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetDoctorAppointments(int doctorId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            _logger.LogInformation("Fetching appointments for Doctor ID: {DoctorId}", doctorId);
            var appointments = await _appointmentService.GetAppointmentsByDoctorAsync(doctorId, startDate, endDate);
            return Ok(appointments);
        }

        // GET: api/appointments/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetPatientAppointments(int patientId)
        {
            _logger.LogInformation("Fetching appointments for Patient ID: {PatientId}", patientId);
            var appointments = await _appointmentService.GetAppointmentsByPatientAsync(patientId);
            return Ok(appointments);
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<ActionResult<AppointmentDto>> CreateAppointment([FromBody] CreateAppointmentDto createAppointmentDto)
        {
            _logger.LogInformation("Attempting to create a new appointment.");
            var newAppointment = await _appointmentService.CreateAppointmentAsync(createAppointmentDto);
            if (newAppointment == null)
            {
                return BadRequest("Could not create appointment. The time slot may be unavailable.");
            }
            return CreatedAtAction(nameof(GetAppointmentById), new { id = newAppointment.Id }, newAppointment);
        }

        // GET: api/appointments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentDto>> GetAppointmentById(int id)
        {
            var appointment = await _appointmentService.GetAppointmentByIdAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }
            return Ok(appointment);
        }

        // GET: api/appointments/availability/doctor/{doctorId}
        [HttpGet("availability/doctor/{doctorId}")]
        public async Task<ActionResult<DoctorAvailabilityDto>> GetDoctorAvailability(int doctorId, [FromQuery] DateTime date)
        {
            _logger.LogInformation("Fetching availability for Doctor ID: {DoctorId} on Date: {Date}", doctorId, date.ToShortDateString());
            var availability = await _appointmentService.GetDoctorAvailabilityAsync(doctorId, date);
            return Ok(availability);
        }
    }
}
