using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Repositories.Interfaces
{
    public interface IMessageRepository : IGenericRepository<Message>
    {
        Task<IEnumerable<Message>> GetInboxMessagesAsync(int userId);
        Task<IEnumerable<Message>> GetSentMessagesAsync(int userId);
        Task<IEnumerable<Message>> GetConversationMessagesAsync(int userId1, int userId2);
        Task<int> GetUnreadMessageCountAsync(int userId);
        Task MarkAllAsReadAsync(int userId, int senderId);
    }
}
