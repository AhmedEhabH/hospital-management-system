using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalHistoryController : ControllerBase
    {
        private readonly IMedicalHistoryService _medicalHistoryService;
        private readonly Serilog.ILogger _logger;

        public MedicalHistoryController(IMedicalHistoryService medicalHistoryService)
        {
            _medicalHistoryService = medicalHistoryService;
            _logger = Log.ForContext<MedicalHistoryController>();
        }

        // GET: api/medicalhistory/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<MedicalHistoryDto>>> GetByUserId(int userId)
        {
            _logger.Information("GET medical histories for UserId: {UserId}", userId);
            var result = await _medicalHistoryService.GetMedicalHistoriesByUserIdAsync(userId);
            return Ok(result);
        }

        // GET: api/medicalhistory/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalHistoryDto>> GetById(int id)
        {
            _logger.Information("GET medical history by Id: {Id}", id);
            var result = await _medicalHistoryService.GetMedicalHistoryByIdAsync(id);
            if (result == null)
            {
                _logger.Warning("Medical history not found for Id: {Id}", id);
                return NotFound();
            }
            return Ok(result);
        }

        // POST: api/medicalhistory
        [HttpPost]
        public async Task<ActionResult<MedicalHistoryDto>> Create(MedicalHistoryDto dto)
        {
            _logger.Information("POST create medical history for UserId: {UserId}", dto.UserId);
            var created = await _medicalHistoryService.AddMedicalHistoryAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/medicalhistory/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MedicalHistoryDto dto)
        {
            _logger.Information("PUT update medical history for Id: {Id}", id);
            var updated = await _medicalHistoryService.UpdateMedicalHistoryAsync(id, dto);
            if (!updated)
            {
                _logger.Warning("Update failed: Medical history not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/medicalhistory/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.Information("DELETE medical history for Id: {Id}", id);
            var deleted = await _medicalHistoryService.DeleteMedicalHistoryAsync(id);
            if (!deleted)
            {
                _logger.Warning("Delete failed: Medical history not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }
    }
}
