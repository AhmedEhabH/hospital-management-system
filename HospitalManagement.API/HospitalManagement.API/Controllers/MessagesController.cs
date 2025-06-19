using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(IMessageService messageService, ILogger<MessagesController> logger)
        {
            _messageService = messageService;
            _logger = logger;
        }

        [HttpGet("inbox/{userId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetInboxMessages(int userId)
        {
            try
            {
                var messages = await _messageService.GetInboxMessagesAsync(userId);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting inbox messages for user {userId}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("sent/{userId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetSentMessages(int userId)
        {
            try
            {
                var messages = await _messageService.GetSentMessagesAsync(userId);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting sent messages for user {userId}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MessageDto>> GetMessage(int id)
        {
            try
            {
                var message = await _messageService.GetMessageByIdAsync(id);
                if (message == null)
                {
                    return NotFound();
                }
                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting message {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage(MessageDto messageDto)
        {
            try
            {
                var createdMessage = await _messageService.CreateMessageAsync(messageDto);
                return CreatedAtAction(nameof(GetMessage), new { id = createdMessage.Id }, createdMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating message");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("mark-as-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                await _messageService.MarkAsReadAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking message {id} as read");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            try
            {
                await _messageService.DeleteMessageAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting message {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        // Medical notification endpoints
        [HttpPost("critical-alert")]
        public async Task<IActionResult> SendCriticalAlert([FromBody] CriticalAlertRequest request)
        {
            try
            {
                await _messageService.SendCriticalLabAlertAsync(request.PatientId, request.LabReportId, request.AlertMessage);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending critical alert");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("appointment-reminder")]
        public async Task<IActionResult> SendAppointmentReminder([FromBody] AppointmentReminderRequest request)
        {
            try
            {
                await _messageService.SendAppointmentReminderAsync(request.PatientId, request.AppointmentDate, request.DoctorName);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending appointment reminder");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("emergency-alert")]
        public async Task<IActionResult> SendEmergencyAlert([FromBody] EmergencyAlertRequest request)
        {
            try
            {
                await _messageService.NotifyDoctorsOfEmergencyAsync(request.PatientId, request.EmergencyDetails);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending emergency alert");
                return StatusCode(500, "Internal server error");
            }
        }
    }

    // Request DTOs for medical notifications
    public class CriticalAlertRequest
    {
        public int PatientId { get; set; }
        public int LabReportId { get; set; }
        public string AlertMessage { get; set; } = string.Empty;
    }

    public class AppointmentReminderRequest
    {
        public int PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string DoctorName { get; set; } = string.Empty;
    }

    public class EmergencyAlertRequest
    {
        public int PatientId { get; set; }
        public string EmergencyDetails { get; set; } = string.Empty;
    }
}
