using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Implementations;
using Microsoft.Extensions.Logging;
using Moq;
using Serilog;
using Xunit;

namespace HospitalManagement.Tests.Services
{
    public class FeedbackServiceTests : IDisposable
    {
        private readonly Mock<IFeedbackRepository> _mockRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<FeedbackService>> _mockLogger;
        private readonly FeedbackService _feedbackService;

        public FeedbackServiceTests()
        {
            _mockRepository = new Mock<IFeedbackRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<FeedbackService>>();

            _feedbackService = new FeedbackService(
                _mockRepository.Object,
                _mockMapper.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task GetFeedbackByIdAsync_ValidId_ReturnsFeedbackDto()
        {
            // Arrange
            var feedbackId = 1;
            var feedback = new Feedback
            {
                Id = feedbackId,
                UserId = 1,
                UserName = "Test User",
                EmailId = "test@example.com",
                Comments = "Test feedback",
                CreatedAt = DateTime.UtcNow
            };
            var feedbackDto = new FeedbackDto
            {
                Id = feedbackId,
                UserId = 1,
                UserName = "Test User",
                EmailId = "test@example.com",
                Comments = "Test feedback",
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(r => r.GetByIdAsync(feedbackId))
                          .ReturnsAsync(feedback);
            _mockMapper.Setup(m => m.Map<FeedbackDto>(feedback))
                      .Returns(feedbackDto);

            // Act
            var result = await _feedbackService.GetFeedbackByIdAsync(feedbackId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(feedbackId, result.Id);
            Assert.Equal("Test User", result.UserName);
        }

        [Fact]
        public async Task GetFeedbackByUserIdAsync_ValidUserId_ReturnsFeedbackList()
        {
            // Arrange
            var userId = 1;
            var feedbacks = new List<Feedback>
            {
                new Feedback
                {
                    Id = 1,
                    UserId = userId,
                    UserName = "Test User",
                    EmailId = "test@example.com",
                    Comments = "Test feedback 1",
                    CreatedAt = DateTime.UtcNow
                },
                new Feedback
                {
                    Id = 2,
                    UserId = userId,
                    UserName = "Test User",
                    EmailId = "test@example.com",
                    Comments = "Test feedback 2",
                    CreatedAt = DateTime.UtcNow
                }
            };
            var feedbackDtos = new List<FeedbackDto>
            {
                new FeedbackDto
                {
                    Id = 1,
                    UserId = userId,
                    UserName = "Test User",
                    EmailId = "test@example.com",
                    Comments = "Test feedback 1",
                    CreatedAt = DateTime.UtcNow
                },
                new FeedbackDto
                {
                    Id = 2,
                    UserId = userId,
                    UserName = "Test User",
                    EmailId = "test@example.com",
                    Comments = "Test feedback 2",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _mockRepository.Setup(r => r.GetByUserIdAsync(userId))
                          .ReturnsAsync(feedbacks);
            _mockMapper.Setup(m => m.Map<IEnumerable<FeedbackDto>>(feedbacks))
                      .Returns(feedbackDtos);

            // Act
            var result = await _feedbackService.GetFeedbackByUserIdAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task CreateFeedbackAsync_ValidFeedback_ReturnsFeedbackDto()
        {
            // Arrange
            var feedbackDto = new FeedbackDto
            {
                UserId = 1,
                UserName = "Test User",
                EmailId = "test@example.com",
                Comments = "Test feedback",
                CreatedAt = DateTime.UtcNow
            };
            var feedback = new Feedback
            {
                Id = 1,
                UserId = 1,
                UserName = "Test User",
                EmailId = "test@example.com",
                Comments = "Test feedback",
                CreatedAt = DateTime.UtcNow
            };
            var createdFeedback = new Feedback
            {
                Id = 1,
                UserId = 1,
                UserName = "Test User",
                EmailId = "test@example.com",
                Comments = "Test feedback",
                CreatedAt = DateTime.UtcNow
            };

            _mockMapper.Setup(m => m.Map<Feedback>(feedbackDto))
                      .Returns(feedback);
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Feedback>()))
                          .ReturnsAsync(createdFeedback);
            _mockMapper.Setup(m => m.Map<FeedbackDto>(createdFeedback))
                      .Returns(feedbackDto);

            // Act
            var result = await _feedbackService.CreateFeedbackAsync(feedbackDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test User", result.UserName);
            Assert.Equal("test@example.com", result.EmailId);
        }

        [Fact]
        public async Task UpdateFeedbackAsync_ValidFeedback_UpdatesSuccessfully()
        {
            // Arrange
            var feedbackDto = new FeedbackDto
            {
                Id = 1,
                UserId = 1,
                UserName = "Updated User",
                EmailId = "updated@example.com",
                Comments = "Updated feedback",
                CreatedAt = DateTime.UtcNow
            };
            var feedback = new Feedback
            {
                Id = 1,
                UserId = 1,
                UserName = "Updated User",
                EmailId = "updated@example.com",
                Comments = "Updated feedback",
                CreatedAt = DateTime.UtcNow
            };

            _mockMapper.Setup(m => m.Map<Feedback>(feedbackDto))
                      .Returns(feedback);
            _mockRepository.Setup(r => r.Update(It.IsAny<Feedback>()))
                          .Returns(Task.CompletedTask);

            // Act
            await _feedbackService.UpdateFeedbackAsync(feedbackDto);

            // Assert
            _mockRepository.Verify(r => r.Update(It.IsAny<Feedback>()), Times.Once);
        }

        [Fact]
        public async Task DeleteFeedbackAsync_ValidId_DeletesSuccessfully()
        {
            // Arrange
            var feedbackId = 1;

            _mockRepository.Setup(r => r.DeleteAsync(feedbackId))
                          .Returns(Task.CompletedTask);

            // Act
            await _feedbackService.DeleteFeedbackAsync(feedbackId);

            // Assert
            _mockRepository.Verify(r => r.DeleteAsync(feedbackId), Times.Once);
        }

        public void Dispose()
        {
            // Clean up resources if needed
            Log.Information("Disposing FeedbackService unit tests");
        }
    }
}
