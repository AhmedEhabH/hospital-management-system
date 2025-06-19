using AutoMapper;
using HospitalManagement.API.Hubs;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Implementations;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Moq;
using Serilog;
using Xunit;

namespace HospitalManagement.Tests.Services
{
    public class MessageServiceTests : IDisposable
    {
        private readonly Mock<IMessageRepository> _mockMessageRepository;
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IHubContext<CommunicationHub>> _mockHubContext;
        private readonly Mock<ILogger<MessageService>> _mockLogger;
        private readonly MessageService _messageService;

        public MessageServiceTests()
        {
            _mockMessageRepository = new Mock<IMessageRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockHubContext = new Mock<IHubContext<CommunicationHub>>();
            _mockLogger = new Mock<ILogger<MessageService>>();

            _messageService = new MessageService(
                _mockMessageRepository.Object,
                _mockUserRepository.Object,
                _mockMapper.Object,
                _mockHubContext.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task CreateMessageAsync_ValidMessage_ReturnsMessageDto()
        {
            // Arrange
            var messageDto = new MessageDto
            {
                SenderId = 1,
                ReceiverId = 2,
                Subject = "Test Subject",
                MessageContent = "Test message content",
                SentDate = DateTime.UtcNow
            };
            var message = new Message
            {
                Id = 1,
                SenderId = 1,
                ReceiverId = 2,
                Subject = "Test Subject",
                MessageContent = "Test message content",
                SentDate = DateTime.UtcNow,
                IsRead = false
            };

            _mockMapper.Setup(m => m.Map<Message>(messageDto))
                      .Returns(message);
            _mockMessageRepository.Setup(r => r.CreateAsync(It.IsAny<Message>()))
                                  .ReturnsAsync(message);
            _mockMapper.Setup(m => m.Map<MessageDto>(message))
                      .Returns(messageDto);

            // Act
            var result = await _messageService.CreateMessageAsync(messageDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Subject", result.Subject);
            Assert.Equal("Test message content", result.MessageContent);
        }

        [Fact]
        public async Task GetMessageByIdAsync_ValidId_ReturnsMessageDto()
        {
            // Arrange
            var messageId = 1;
            var message = new Message
            {
                Id = messageId,
                SenderId = 1,
                ReceiverId = 2,
                Subject = "Test Subject",
                MessageContent = "Test message content",
                SentDate = DateTime.UtcNow,
                IsRead = false
            };
            var messageDto = new MessageDto
            {
                Id = messageId,
                SenderId = 1,
                ReceiverId = 2,
                Subject = "Test Subject",
                MessageContent = "Test message content",
                SentDate = DateTime.UtcNow
            };

            _mockMessageRepository.Setup(r => r.GetByIdAsync(messageId))
                                  .ReturnsAsync(message);
            _mockMapper.Setup(m => m.Map<MessageDto>(message))
                      .Returns(messageDto);

            // Act
            var result = await _messageService.GetMessageByIdAsync(messageId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(messageId, result.Id);
        }

        [Fact]
        public async Task MarkAsReadAsync_ValidMessageId_UpdatesMessage()
        {
            // Arrange
            var messageId = 1;
            var message = new Message
            {
                Id = messageId,
                SenderId = 1,
                ReceiverId = 2,
                Subject = "Test Subject",
                MessageContent = "Test message content",
                SentDate = DateTime.UtcNow,
                IsRead = false
            };

            _mockMessageRepository.Setup(r => r.GetByIdAsync(messageId))
                                  .ReturnsAsync(message);
            _mockMessageRepository.Setup(r => r.UpdateAsync(It.IsAny<Message>()))
                                  .Returns(Task.CompletedTask);

            // Act
            await _messageService.MarkAsReadAsync(messageId);

            // Assert
            _mockMessageRepository.Verify(r => r.UpdateAsync(It.IsAny<Message>()), Times.Once);
            Assert.True(message.IsRead);
        }

        public void Dispose()
        {
            // Clean up resources if needed
            Log.Information("Disposing MessageService unit tests");
        }
    }
}
