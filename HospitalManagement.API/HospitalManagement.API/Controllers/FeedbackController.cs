using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;
        private readonly ILogger<FeedbackController> _logger;

        public FeedbackController(IFeedbackService feedbackService, ILogger<FeedbackController> logger)
        {
            _feedbackService = feedbackService;
            _logger = logger;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<FeedbackDto>>> GetFeedbacksByUserId(int userId)
        {
            try
            {
                // FIXED: Use correct method name
                var feedbacks = await _feedbackService.GetFeedbackByUserIdAsync(userId);
                return Ok(feedbacks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting feedbacks for user {userId}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FeedbackDto>> GetFeedback(int id)
        {
            try
            {
                var feedback = await _feedbackService.GetFeedbackByIdAsync(id);
                if (feedback == null)
                {
                    return NotFound();
                }
                return Ok(feedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting feedback {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<FeedbackDto>> CreateFeedback(FeedbackDto feedbackDto)
        {
            try
            {
                // FIXED: Use correct method name
                var createdFeedback = await _feedbackService.CreateFeedbackAsync(feedbackDto);
                return CreatedAtAction(nameof(GetFeedback), new { id = createdFeedback.Id }, createdFeedback);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating feedback");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFeedback(int id, FeedbackDto feedbackDto)
        {
            try
            {
                if (id != feedbackDto.Id)
                {
                    return BadRequest("ID mismatch");
                }

                // FIXED: Use correct method signature
                await _feedbackService.UpdateFeedbackAsync(feedbackDto);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating feedback {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            try
            {
                await _feedbackService.DeleteFeedbackAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting feedback {id}");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
