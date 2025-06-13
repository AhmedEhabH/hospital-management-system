using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LabReportsController : ControllerBase
    {

        private readonly ILabReportService _labReportService;
        private readonly Serilog.ILogger _logger;

        public LabReportsController(ILabReportService labReportService)
        {
            _labReportService = labReportService;
            _logger = Log.ForContext<LabReportsController>();
        }

        // GET: api/labreports/patient/{patientId}
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<LabReportDto>>> GetByPatientId(int patientId)
        {
            _logger.Information("GET lab reports for PatientId: {PatientId}", patientId);
            var result = await _labReportService.GetLabReportsByPatientIdAsync(patientId);
            return Ok(result);
        }

        // GET: api/labreports/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LabReportDto>> GetById(int id)
        {
            _logger.Information("GET lab report by Id: {Id}", id);
            var result = await _labReportService.GetLabReportByIdAsync(id);
            if (result == null)
            {
                _logger.Warning("Lab report not found for Id: {Id}", id);
                return NotFound();
            }
            return Ok(result);
        }

        // POST: api/labreports
        [HttpPost]
        public async Task<ActionResult<LabReportDto>> Create(LabReportDto dto)
        {
            _logger.Information("POST create lab report for PatientId: {PatientId}", dto.PatientId);
            var created = await _labReportService.AddLabReportAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/labreports/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, LabReportDto dto)
        {
            _logger.Information("PUT update lab report for Id: {Id}", id);
            var updated = await _labReportService.UpdateLabReportAsync(id, dto);
            if (!updated)
            {
                _logger.Warning("Update failed: Lab report not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/labreports/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.Information("DELETE lab report for Id: {Id}", id);
            var deleted = await _labReportService.DeleteLabReportAsync(id);
            if (!deleted)
            {
                _logger.Warning("Delete failed: Lab report not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }
    }
}
