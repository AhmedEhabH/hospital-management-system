using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicalHistoryController : ControllerBase
    {
        private readonly IMedicalHistoryService _medicalHistoryService;
        private readonly ILogger<MedicalHistoryController> _logger;

        public MedicalHistoryController(IMedicalHistoryService medicalHistoryService, ILogger<MedicalHistoryController> logger)
        {
            _medicalHistoryService = medicalHistoryService;
            _logger = logger;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<MedicalHistoryDto>>> GetMedicalHistoryByUserId(int userId)
        {
            try
            {
                var medicalHistories = await _medicalHistoryService.GetMedicalHistoryByUserIdAsync(userId);
                return Ok(medicalHistories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting medical history for user {userId}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicalHistoryDto>> GetMedicalHistory(int id)
        {
            try
            {
                var medicalHistory = await _medicalHistoryService.GetMedicalHistoryByIdAsync(id);
                if (medicalHistory == null)
                {
                    return NotFound();
                }
                return Ok(medicalHistory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting medical history {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MedicalHistoryDto>> CreateMedicalHistory(MedicalHistoryDto medicalHistoryDto)
        {
            try
            {
                var createdMedicalHistory = await _medicalHistoryService.CreateMedicalHistoryAsync(medicalHistoryDto);
                return CreatedAtAction(nameof(GetMedicalHistory), new { id = createdMedicalHistory.Id }, createdMedicalHistory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical history");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicalHistory(int id, MedicalHistoryDto medicalHistoryDto)
        {
            try
            {
                if (id != medicalHistoryDto.Id)
                {
                    return BadRequest("ID mismatch");
                }

                await _medicalHistoryService.UpdateMedicalHistoryAsync(medicalHistoryDto);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating medical history {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicalHistory(int id)
        {
            try
            {
                await _medicalHistoryService.DeleteMedicalHistoryAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting medical history {id}");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
