using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LabReportsController : ControllerBase
    {
        private readonly ILabReportService _labReportService;
        private readonly ILogger<LabReportsController> _logger;

        public LabReportsController(ILabReportService labReportService, ILogger<LabReportsController> logger)
        {
            _labReportService = labReportService;
            _logger = logger;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<LabReportDto>>> GetLabReportsByPatientId(int patientId)
        {
            try
            {
                var labReports = await _labReportService.GetLabReportsByPatientIdAsync(patientId);
                return Ok(labReports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting lab reports for patient {patientId}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LabReportDto>> GetLabReport(int id)
        {
            try
            {
                var labReport = await _labReportService.GetLabReportByIdAsync(id);
                if (labReport == null)
                {
                    return NotFound();
                }
                return Ok(labReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting lab report {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<LabReportDto>> CreateLabReport(LabReportDto labReportDto)
        {
            try
            {
                var createdLabReport = await _labReportService.CreateLabReportAsync(labReportDto);
                return CreatedAtAction(nameof(GetLabReport), new { id = createdLabReport.Id }, createdLabReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating lab report");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLabReport(int id, LabReportDto labReportDto)
        {
            try
            {
                if (id != labReportDto.Id)
                {
                    return BadRequest("ID mismatch");
                }

                await _labReportService.UpdateLabReportAsync(labReportDto);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating lab report {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLabReport(int id)
        {
            try
            {
                await _labReportService.DeleteLabReportAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting lab report {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get critical lab reports across all patients
        /// </summary>
        /// <returns>List of critical lab reports</returns>
        [HttpGet("critical")]
        public async Task<ActionResult<IEnumerable<LabReportDto>>> GetCriticalLabReports()
        {
            try
            {
                _logger.LogInformation("Fetching critical lab reports");
                var criticalReports = await _labReportService.GetCriticalLabReportsAsync();
                return Ok(criticalReports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching critical lab reports");
                return StatusCode(500, "Internal server error occurred while fetching critical lab reports");
            }
        }

    }
}
