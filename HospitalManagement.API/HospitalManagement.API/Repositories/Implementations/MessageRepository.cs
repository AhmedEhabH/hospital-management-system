using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class MessageRepository : GenericRepository<Message>, IMessageRepository
    {
        // FIXED: Add logger parameter to constructor
        public MessageRepository(HospitalDbContext context, ILogger<MessageRepository> logger)
            : base(context, logger)
        {
        }

        public async Task<IEnumerable<Message>> GetInboxMessagesAsync(int userId)
        {
            return await _dbSet
                .Where(m => m.ReceiverId == userId)
                .OrderByDescending(m => m.SentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Message>> GetSentMessagesAsync(int userId)
        {
            return await _dbSet
                .Where(m => m.SenderId == userId)
                .OrderByDescending(m => m.SentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Message>> GetConversationMessagesAsync(int userId1, int userId2)
        {
            return await _dbSet
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                           (m.SenderId == userId2 && m.ReceiverId == userId1))
                .OrderBy(m => m.SentDate)
                .ToListAsync();
        }

        public async Task<int> GetUnreadMessageCountAsync(int userId)
        {
            return await _dbSet
                .CountAsync(m => m.ReceiverId == userId && !m.IsRead);
        }

        public async Task MarkAllAsReadAsync(int userId, int senderId)
        {
            var messages = await _dbSet
                .Where(m => m.ReceiverId == userId && m.SenderId == senderId && !m.IsRead)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}
