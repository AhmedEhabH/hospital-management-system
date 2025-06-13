using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class MessageRepository : GenericRepository<Message>, IMessageRepository
    {
        public MessageRepository(HospitalDbContext context) : base(context) { }

        public async Task<IEnumerable<Message>> GetInboxAsync(int userId)
        {
            _logger.Information("Fetching Inbox Messages for UserId: {UserId}", userId);
            return await _context.Messages
                .Where(m => m.ReceiverId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Message>> GetSentAsync(int userId)
        {
            _logger.Information("Fetching Sent Messages for UserId: {UserId}", userId);
            return await _context.Messages
                .Where(m => m.SenderId == userId)
                .ToListAsync();
        }
    }
}