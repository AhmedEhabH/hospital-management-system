using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HospitalController : ControllerBase
    {
        private readonly IHospitalService _hospitalService;
        private readonly ILogger<HospitalController> _logger;

        public HospitalController(IHospitalService hospitalService, ILogger<HospitalController> logger)
        {
            _hospitalService = hospitalService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HospitalInfoDto>>> GetAllHospitalInfo()
        {
            try
            {
                // FIXED: Use correct method name
                var hospitalInfos = await _hospitalService.GetAllHospitalInfoAsync();
                return Ok(hospitalInfos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all hospital info");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HospitalInfoDto>> GetHospitalInfo(int id)
        {
            try
            {
                var hospitalInfo = await _hospitalService.GetHospitalInfoByIdAsync(id);
                if (hospitalInfo == null)
                {
                    return NotFound();
                }
                return Ok(hospitalInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting hospital info {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<HospitalInfoDto>> CreateHospitalInfo(HospitalInfoDto hospitalInfoDto)
        {
            try
            {
                // FIXED: Use correct method name
                var createdHospitalInfo = await _hospitalService.CreateHospitalInfoAsync(hospitalInfoDto);
                return CreatedAtAction(nameof(GetHospitalInfo), new { id = createdHospitalInfo.Id }, createdHospitalInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating hospital info");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHospitalInfo(int id, HospitalInfoDto hospitalInfoDto)
        {
            try
            {
                if (id != hospitalInfoDto.Id)
                {
                    return BadRequest("ID mismatch");
                }

                // FIXED: Use correct method signature
                await _hospitalService.UpdateHospitalInfoAsync(hospitalInfoDto);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating hospital info {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHospitalInfo(int id)
        {
            try
            {
                await _hospitalService.DeleteHospitalInfoAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting hospital info {id}");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
