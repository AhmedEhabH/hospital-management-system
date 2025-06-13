using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;
        private readonly Serilog.ILogger _logger;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
            _logger = Log.ForContext<FeedbackController>();
        }

        // GET: api/feedback/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<FeedbackDto>>> GetByUserId(int userId)
        {
            _logger.Information("GET feedbacks for UserId: {UserId}", userId);
            var result = await _feedbackService.GetFeedbacksByUserIdAsync(userId);
            return Ok(result);
        }

        // GET: api/feedback/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<FeedbackDto>> GetById(int id)
        {
            _logger.Information("GET feedback by Id: {Id}", id);
            var result = await _feedbackService.GetFeedbackByIdAsync(id);
            if (result == null)
            {
                _logger.Warning("Feedback not found for Id: {Id}", id);
                return NotFound();
            }
            return Ok(result);
        }

        // POST: api/feedback
        [HttpPost]
        public async Task<ActionResult<FeedbackDto>> Create(FeedbackDto dto)
        {
            _logger.Information("POST create feedback for UserId: {UserId}", dto.UserId);
            var created = await _feedbackService.AddFeedbackAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/feedback/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, FeedbackDto dto)
        {
            _logger.Information("PUT update feedback for Id: {Id}", id);
            var updated = await _feedbackService.UpdateFeedbackAsync(id, dto);
            if (!updated)
            {
                _logger.Warning("Update failed: Feedback not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/feedback/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.Information("DELETE feedback for Id: {Id}", id);
            var deleted = await _feedbackService.DeleteFeedbackAsync(id);
            if (!deleted)
            {
                _logger.Warning("Delete failed: Feedback not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }
    }
}
