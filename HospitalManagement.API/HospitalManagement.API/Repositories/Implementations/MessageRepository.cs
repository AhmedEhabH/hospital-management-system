using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class MessageRepository : GenericRepository<Message>, IMessageRepository
    {
        public MessageRepository(HospitalDbContext context, ILogger<MessageRepository> logger) : base(context, logger)
        {
        }

        public async Task<IEnumerable<Message>> GetInboxAsync(int userId)
        {
            return await _context.Messages
                .Where(m => m.ReceiverId == userId)
                .OrderByDescending(m => m.SentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Message>> GetSentAsync(int userId)
        {
            return await _context.Messages
                .Where(m => m.SenderId == userId)
                .OrderByDescending(m => m.SentDate)
                .ToListAsync();
        }

        public async Task<bool> MarkAsReadAsync(int messageId)
        {
            var message = await _context.Messages.FindAsync(messageId);
            if (message == null)
                return false;

            message.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCountAsync()
        {
            return await _context.Messages.CountAsync(m => !m.IsRead);
        }

        public async Task<int> GetUnreadCountByUserAsync(int userId)
        {
            return await _context.Messages.CountAsync(m => m.ReceiverId == userId && !m.IsRead);
        }
    }
}
