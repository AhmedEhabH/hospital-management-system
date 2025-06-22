using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using HospitalManagement.API.Hubs;

namespace HospitalManagement.API.Services.Implementations
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IHubContext<CommunicationHub> _hubContext;
        private readonly ILogger<MessageService> _logger;

        public MessageService(
            IMessageRepository messageRepository,
            IUserRepository userRepository,
            IMapper mapper,
            IHubContext<CommunicationHub> hubContext,
            ILogger<MessageService> logger)
        {
            _messageRepository = messageRepository;
            _userRepository = userRepository;
            _mapper = mapper;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<MessageDto> CreateMessageAsync(MessageDto messageDto)
        {
            try
            {
                var message = _mapper.Map<Message>(messageDto);
                message.SentDate = DateTime.UtcNow;
                message.IsRead = false;

                var createdMessage = await _messageRepository.CreateAsync(message);
                var result = _mapper.Map<MessageDto>(createdMessage);

                _logger.LogInformation($"Message created: {createdMessage.Id} from {createdMessage.SenderId} to {createdMessage.ReceiverId}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating message");
                throw;
            }
        }

        public async Task<MessageDto?> GetMessageByIdAsync(int id)
        {
            try
            {
                var message = await _messageRepository.GetByIdAsync(id);
                return message != null ? _mapper.Map<MessageDto>(message) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting message by id: {id}");
                throw;
            }
        }

        public async Task<IEnumerable<MessageDto>> GetInboxMessagesAsync(int userId)
        {
            try
            {
                var messages = await _messageRepository.GetInboxAsync(userId);
                return _mapper.Map<IEnumerable<MessageDto>>(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting inbox messages for user: {userId}");
                throw;
            }
        }

        public async Task<IEnumerable<MessageDto>> GetSentMessagesAsync(int userId)
        {
            try
            {
                var messages = await _messageRepository.GetSentAsync(userId);
                return _mapper.Map<IEnumerable<MessageDto>>(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting sent messages for user: {userId}");
                throw;
            }
        }

        // FIXED: Implement MarkAsReadAsync method
        public async Task MarkAsReadAsync(int messageId)
        {
            try
            {
                var message = await _messageRepository.GetByIdAsync(messageId);
                if (message != null)
                {
                    message.IsRead = true;
                    await _messageRepository.UpdateAsync(message);

                    _logger.LogInformation($"Message {messageId} marked as read");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking message as read: {messageId}");
                throw;
            }
        }

        // FIXED: Implement DeleteMessageAsync method
        public async Task DeleteMessageAsync(int messageId)
        {
            try
            {
                await _messageRepository.DeleteAsync(messageId);
                _logger.LogInformation($"Message {messageId} deleted");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting message: {messageId}");
                throw;
            }
        }

        // Real-time notification methods
        public async Task SendCriticalLabAlertAsync(int patientId, int labReportId, string alertMessage)
        {
            try
            {
                // Send real-time notification via SignalR
                await _hubContext.Clients.Group($"User_{patientId}")
                    .SendAsync("CriticalAlert", new
                    {
                        Title = "Critical Lab Results",
                        Message = alertMessage,
                        Type = "medical",
                        Priority = "critical",
                        Timestamp = DateTime.UtcNow,
                        ActionUrl = $"/lab-reports/{labReportId}",
                        Data = new { LabReportId = labReportId }
                    });

                // Also notify all doctors
                await _hubContext.Clients.Group("Doctors")
                    .SendAsync("CriticalAlert", new
                    {
                        Title = "Patient Critical Lab Results",
                        Message = $"Patient ID {patientId}: {alertMessage}",
                        Type = "medical",
                        Priority = "critical",
                        Timestamp = DateTime.UtcNow,
                        Data = new { PatientId = patientId, LabReportId = labReportId }
                    });

                _logger.LogWarning($"Critical lab alert sent for patient {patientId}, lab report {labReportId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending critical lab alert");
                throw;
            }
        }

        public async Task SendAppointmentReminderAsync(int patientId, DateTime appointmentDate, string doctorName)
        {
            try
            {
                await _hubContext.Clients.Group($"User_{patientId}")
                    .SendAsync("ReceiveNotification", new
                    {
                        Title = "Appointment Reminder",
                        Message = $"You have an appointment with {doctorName} on {appointmentDate:MMM dd, yyyy} at {appointmentDate:HH:mm}",
                        Type = "appointment",
                        Priority = "high",
                        Timestamp = DateTime.UtcNow,
                        ActionUrl = "/appointments"
                    });

                _logger.LogInformation($"Appointment reminder sent to patient {patientId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending appointment reminder");
                throw;
            }
        }

        public async Task NotifyDoctorsOfEmergencyAsync(int patientId, string emergencyDetails)
        {
            try
            {
                await _hubContext.Clients.Group("Doctors")
                    .SendAsync("EmergencyAlert", new
                    {
                        Title = "Emergency Alert",
                        Message = $"Emergency situation for Patient ID {patientId}: {emergencyDetails}",
                        Type = "emergency",
                        Priority = "critical",
                        Timestamp = DateTime.UtcNow,
                        Data = new { PatientId = patientId }
                    });

                _logger.LogCritical($"Emergency alert sent for patient {patientId}: {emergencyDetails}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending emergency alert");
                throw;
            }
        }
    }
}
