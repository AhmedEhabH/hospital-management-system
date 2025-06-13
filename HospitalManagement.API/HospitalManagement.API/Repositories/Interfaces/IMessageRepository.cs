using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Repositories.Interfaces
{
    public interface IMessageRepository : IGenericRepository<Message>
    {
        Task<IEnumerable<Message>> GetInboxAsync(int userId);
        Task<IEnumerable<Message>> GetSentAsync(int userId);
    }
}