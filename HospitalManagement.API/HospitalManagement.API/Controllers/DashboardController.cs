using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication for all dashboard endpoints
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        /// <summary>
        /// Get system-wide dashboard statistics
        /// </summary>
        /// <returns>Dashboard statistics including patient count, doctor count, etc.</returns>
        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetSystemStats()
        {
            try
            {
                _logger.LogInformation("Fetching system dashboard statistics");
                var stats = await _dashboardService.GetSystemStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching system statistics");
                return StatusCode(500, "Internal server error occurred while fetching statistics");
            }
        }

        /// <summary>
        /// Get patient-specific dashboard data
        /// </summary>
        /// <param name="patientId">Patient ID</param>
        /// <returns>Patient dashboard data</returns>
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<PatientDashboardDto>> GetPatientDashboard(int patientId)
        {
            try
            {
                _logger.LogInformation("Fetching patient dashboard data for patient ID: {PatientId}", patientId);
                var dashboardData = await _dashboardService.GetPatientDashboardAsync(patientId);

                if (dashboardData == null)
                {
                    return NotFound($"Patient with ID {patientId} not found");
                }

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching patient dashboard for ID: {PatientId}", patientId);
                return StatusCode(500, "Internal server error occurred while fetching patient dashboard");
            }
        }

        /// <summary>
        /// Get doctor-specific dashboard data
        /// </summary>
        /// <param name="doctorId">Doctor ID</param>
        /// <returns>Doctor dashboard data</returns>
        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<DoctorDashboardDto>> GetDoctorDashboard(int doctorId)
        {
            try
            {
                _logger.LogInformation("Fetching doctor dashboard data for doctor ID: {DoctorId}", doctorId);
                var dashboardData = await _dashboardService.GetDoctorDashboardAsync(doctorId);

                if (dashboardData == null)
                {
                    return NotFound($"Doctor with ID {doctorId} not found");
                }

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching doctor dashboard for ID: {DoctorId}", doctorId);
                return StatusCode(500, "Internal server error occurred while fetching doctor dashboard");
            }
        }

        /// <summary>
        /// Get recent user activities for admin dashboard
        /// </summary>
        /// <param name="limit">Number of activities to retrieve</param>
        /// <returns>List of recent user activities</returns>
        [HttpGet("user-activities")]
        public async Task<ActionResult<List<UserActivityDto>>> GetRecentUserActivities([FromQuery] int limit = 20)
        {
            try
            {
                _logger.LogInformation("Fetching recent user activities with limit: {Limit}", limit);
                var activities = await _dashboardService.GetRecentUserActivitiesAsync(limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching user activities");
                return StatusCode(500, "Internal server error occurred while fetching user activities");
            }
        }

    }
}
