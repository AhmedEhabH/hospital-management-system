using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IMessageService
    {
        Task<IEnumerable<MessageDto>> GetInboxAsync(int userId);
        Task<IEnumerable<MessageDto>> GetSentAsync(int userId);
        Task<MessageDto?> GetMessageByIdAsync(int id);
        Task<MessageDto> SendMessageAsync(MessageDto dto);
        Task<bool> MarkAsReadAsync(int id);
        Task<bool> DeleteMessageAsync(int id);
    }
}
