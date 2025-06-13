using Xunit;
using Moq;
using AutoMapper;
using FluentAssertions;
using HospitalManagement.API.Services.Implementations;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Repositories.Interfaces;
using Serilog;

namespace HospitalManagement.Tests.Services
{
    public class MessageServiceTests : IDisposable
    {
        private readonly Mock<IMessageRepository> _mockMessageRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly MessageService _messageService;

        public MessageServiceTests()
        {
            Log.Information("Setting up MessageService unit tests");

            _mockMessageRepository = new Mock<IMessageRepository>();
            _mockMapper = new Mock<IMapper>();

            _messageService = new MessageService(
                _mockMessageRepository.Object,
                _mockMapper.Object);
        }

        [Fact]
        public async Task GetInboxAsync_ValidUserId_ReturnsInboxMessages()
        {
            // Arrange
            Log.Information("Testing GetInboxAsync with valid user ID");

            var userId = 1;
            var messages = new List<Message>
            {
                new Message
                {
                    Id = 1,
                    ReceiverId = userId,
                    Subject = "Test Message",
                    MessageContent = "This is a test message",
                    IsRead = false
                }
            };
            var messageDtos = new List<MessageDto>
            {
                new MessageDto
                {
                    Id = 1,
                    ReceiverId = userId,
                    Subject = "Test Message",
                    MessageContent = "This is a test message",
                    IsRead = false
                }
            };

            _mockMessageRepository.Setup(r => r.GetInboxAsync(userId))
                .ReturnsAsync(messages);
            _mockMapper.Setup(m => m.Map<IEnumerable<MessageDto>>(messages))
                .Returns(messageDtos);

            // Act
            var result = await _messageService.GetInboxAsync(userId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().Subject.Should().Be("Test Message");
            result.First().IsRead.Should().BeFalse();

            Log.Information("GetInboxAsync test completed successfully");
        }

        [Fact]
        public async Task SendMessageAsync_ValidDto_ReturnsCreatedMessage()
        {
            // Arrange
            Log.Information("Testing SendMessageAsync with valid DTO");

            var dto = new MessageDto
            {
                SenderId = 1,
                ReceiverId = 2,
                Subject = "New Message",
                MessageContent = "Hello from sender"
            };
            var entity = new Message
            {
                Id = 1,
                SenderId = 1,
                ReceiverId = 2,
                Subject = "New Message",
                MessageContent = "Hello from sender"
            };

            _mockMapper.Setup(m => m.Map<Message>(dto)).Returns(entity);
            _mockMessageRepository.Setup(r => r.AddAsync(entity)).Returns(Task.CompletedTask);
            _mockMessageRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);
            _mockMapper.Setup(m => m.Map<MessageDto>(entity)).Returns(dto);

            // Act
            var result = await _messageService.SendMessageAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.Subject.Should().Be("New Message");
            result.MessageContent.Should().Be("Hello from sender");

            Log.Information("SendMessageAsync test completed successfully");
        }

        [Fact]
        public async Task MarkAsReadAsync_ExistingMessage_ReturnsTrue()
        {
            // Arrange
            Log.Information("Testing MarkAsReadAsync with existing message");

            var messageId = 1;
            var message = new Message { Id = messageId, IsRead = false };

            _mockMessageRepository.Setup(r => r.GetByIdAsync(messageId)).ReturnsAsync(message);
            _mockMessageRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            var result = await _messageService.MarkAsReadAsync(messageId);

            // Assert
            result.Should().BeTrue();
            message.IsRead.Should().BeTrue();

            Log.Information("MarkAsReadAsync test completed successfully");
        }

        public void Dispose()
        {
            Log.Information("Disposing MessageService unit tests");
        }
    }
}
