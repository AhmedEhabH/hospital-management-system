using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HospitalController : ControllerBase
    {
        private readonly IHospitalService _hospitalService;
        private readonly Serilog.ILogger _logger;

        public HospitalController(IHospitalService hospitalService)
        {
            _hospitalService = hospitalService;
            _logger = Log.ForContext<HospitalController>();
        }

        // GET: api/hospital
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HospitalInfoDto>>> GetAll()
        {
            _logger.Information("GET all hospital info requested.");
            var result = await _hospitalService.GetAllHospitalInfosAsync();
            return Ok(result);
        }

        // GET: api/hospital/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<HospitalInfoDto>> GetById(int id)
        {
            _logger.Information("GET hospital info by Id: {Id}", id);
            var result = await _hospitalService.GetHospitalInfoByIdAsync(id);
            if (result == null)
            {
                _logger.Warning("Hospital info not found for Id: {Id}", id);
                return NotFound();
            }
            return Ok(result);
        }

        // POST: api/hospital
        [HttpPost]
        public async Task<ActionResult<HospitalInfoDto>> Create(HospitalInfoDto dto)
        {
            _logger.Information("POST create hospital info requested.");
            var created = await _hospitalService.AddHospitalInfoAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/hospital/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, HospitalInfoDto dto)
        {
            _logger.Information("PUT update hospital info for Id: {Id}", id);
            var updated = await _hospitalService.UpdateHospitalInfoAsync(id, dto);
            if (!updated)
            {
                _logger.Warning("Update failed: Hospital info not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/hospital/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.Information("DELETE hospital info for Id: {Id}", id);
            var deleted = await _hospitalService.DeleteHospitalInfoAsync(id);
            if (!deleted)
            {
                _logger.Warning("Delete failed: Hospital info not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }
    }
}
