using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {

        private readonly IMessageService _messageService;
        private readonly Serilog.ILogger _logger;

        public MessagesController(IMessageService messageService)
        {
            _messageService = messageService;
            _logger = Log.ForContext<MessagesController>();
        }

        // GET: api/messages/inbox/{userId}
        [HttpGet("inbox/{userId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetInbox(int userId)
        {
            _logger.Information("GET inbox messages for UserId: {UserId}", userId);
            var result = await _messageService.GetInboxAsync(userId);
            return Ok(result);
        }

        // GET: api/messages/sent/{userId}
        [HttpGet("sent/{userId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetSent(int userId)
        {
            _logger.Information("GET sent messages for UserId: {UserId}", userId);
            var result = await _messageService.GetSentAsync(userId);
            return Ok(result);
        }

        // GET: api/messages/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MessageDto>> GetById(int id)
        {
            _logger.Information("GET message by Id: {Id}", id);
            var result = await _messageService.GetMessageByIdAsync(id);
            if (result == null)
            {
                _logger.Warning("Message not found for Id: {Id}", id);
                return NotFound();
            }
            return Ok(result);
        }

        // POST: api/messages
        [HttpPost]
        public async Task<ActionResult<MessageDto>> Send(MessageDto dto)
        {
            _logger.Information("POST send message from SenderId: {SenderId} to ReceiverId: {ReceiverId}", dto.SenderId, dto.ReceiverId);
            var created = await _messageService.SendMessageAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/messages/mark-as-read/{id}
        [HttpPut("mark-as-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            _logger.Information("PUT mark message as read for Id: {Id}", id);
            var updated = await _messageService.MarkAsReadAsync(id);
            if (!updated)
            {
                _logger.Warning("Mark as read failed: Message not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/messages/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.Information("DELETE message for Id: {Id}", id);
            var deleted = await _messageService.DeleteMessageAsync(id);
            if (!deleted)
            {
                _logger.Warning("Delete failed: Message not found for Id: {Id}", id);
                return NotFound();
            }
            return NoContent();
        }
    }
}
