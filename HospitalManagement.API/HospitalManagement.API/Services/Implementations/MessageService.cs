using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using Serilog;

namespace HospitalManagement.API.Services.Implementations
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IMapper _mapper;
        private readonly Serilog.ILogger _logger;

        public MessageService(IMessageRepository messageRepository, IMapper mapper)
        {
            _messageRepository = messageRepository;
            _mapper = mapper;
            _logger = Log.ForContext<MessageService>();
        }

        public async Task<IEnumerable<MessageDto>> GetInboxAsync(int userId)
        {
            _logger.Information("Fetching inbox messages for UserId: {UserId}", userId);
            var messages = await _messageRepository.GetInboxAsync(userId);
            return _mapper.Map<IEnumerable<MessageDto>>(messages);
        }

        public async Task<IEnumerable<MessageDto>> GetSentAsync(int userId)
        {
            _logger.Information("Fetching sent messages for UserId: {UserId}", userId);
            var messages = await _messageRepository.GetSentAsync(userId);
            return _mapper.Map<IEnumerable<MessageDto>>(messages);
        }

        public async Task<MessageDto?> GetMessageByIdAsync(int id)
        {
            _logger.Information("Fetching message with Id: {Id}", id);
            var message = await _messageRepository.GetByIdAsync(id);
            return message == null ? null : _mapper.Map<MessageDto>(message);
        }

        public async Task<MessageDto> SendMessageAsync(MessageDto dto)
        {
            _logger.Information("Sending new message from SenderId: {SenderId} to ReceiverId: {ReceiverId}", dto.SenderId, dto.ReceiverId);
            var entity = _mapper.Map<Message>(dto);
            await _messageRepository.AddAsync(entity);
            await _messageRepository.SaveChangesAsync();
            return _mapper.Map<MessageDto>(entity);
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            _logger.Information("Marking message as read with Id: {Id}", id);
            var entity = await _messageRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Message not found for Id: {Id}", id);
                return false;
            }
            entity.IsRead = true;
            _messageRepository.Update(entity);
            await _messageRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteMessageAsync(int id)
        {
            _logger.Information("Deleting message with Id: {Id}", id);
            var entity = await _messageRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Message not found for Id: {Id}", id);
                return false;
            }
            _messageRepository.Remove(entity);
            await _messageRepository.SaveChangesAsync();
            return true;
        }
    }
}