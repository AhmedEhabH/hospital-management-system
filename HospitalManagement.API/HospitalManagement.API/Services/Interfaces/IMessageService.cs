using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IMessageService
    {
        // CRUD operations
        Task<MessageDto> CreateMessageAsync(MessageDto messageDto);
        Task<MessageDto?> GetMessageByIdAsync(int id);
        Task<IEnumerable<MessageDto>> GetInboxMessagesAsync(int userId);
        Task<IEnumerable<MessageDto>> GetSentMessagesAsync(int userId);

        // FIXED: Add missing methods that are implemented in MessageService
        Task MarkAsReadAsync(int messageId);
        Task DeleteMessageAsync(int messageId);

        // Real-time notification methods
        Task SendCriticalLabAlertAsync(int patientId, int labReportId, string alertMessage);
        Task SendAppointmentReminderAsync(int patientId, DateTime appointmentDate, string doctorName);
        Task NotifyDoctorsOfEmergencyAsync(int patientId, string emergencyDetails);
    }
}
