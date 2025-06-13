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
    public class FeedbackServiceTests : IDisposable
    {
        private readonly Mock<IFeedbackRepository> _mockFeedbackRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly FeedbackService _feedbackService;

        public FeedbackServiceTests()
        {
            Log.Information("Setting up FeedbackService unit tests");

            _mockFeedbackRepository = new Mock<IFeedbackRepository>();
            _mockMapper = new Mock<IMapper>();

            _feedbackService = new FeedbackService(
                _mockFeedbackRepository.Object,
                _mockMapper.Object);
        }

        [Fact]
        public async Task GetFeedbacksByUserIdAsync_ValidUserId_ReturnsFeedbacks()
        {
            // Arrange
            Log.Information("Testing GetFeedbacksByUserIdAsync with valid user ID");

            var userId = 1;
            var feedbacks = new List<Feedback>
            {
                new Feedback { Id = 1, UserId = userId, Comments = "Great service!" }
            };
            var feedbackDtos = new List<FeedbackDto>
            {
                new FeedbackDto { Id = 1, UserId = userId, Comments = "Great service!" }
            };

            _mockFeedbackRepository.Setup(r => r.GetByUserIdAsync(userId))
                .ReturnsAsync(feedbacks);
            _mockMapper.Setup(m => m.Map<IEnumerable<FeedbackDto>>(feedbacks))
                .Returns(feedbackDtos);

            // Act
            var result = await _feedbackService.GetFeedbacksByUserIdAsync(userId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().Comments.Should().Be("Great service!");

            Log.Information("GetFeedbacksByUserIdAsync test completed successfully");
        }

        [Fact]
        public async Task AddFeedbackAsync_ValidDto_ReturnsCreatedFeedback()
        {
            // Arrange
            Log.Information("Testing AddFeedbackAsync with valid DTO");

            var dto = new FeedbackDto { UserId = 1, Comments = "Excellent care!" };
            var entity = new Feedback { Id = 1, UserId = 1, Comments = "Excellent care!" };

            _mockMapper.Setup(m => m.Map<Feedback>(dto)).Returns(entity);
            _mockFeedbackRepository.Setup(r => r.AddAsync(entity)).Returns(Task.CompletedTask);
            _mockFeedbackRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);
            _mockMapper.Setup(m => m.Map<FeedbackDto>(entity)).Returns(dto);

            // Act
            var result = await _feedbackService.AddFeedbackAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.Comments.Should().Be("Excellent care!");

            Log.Information("AddFeedbackAsync test completed successfully");
        }

        public void Dispose()
        {
            Log.Information("Disposing FeedbackService unit tests");
        }
    }
}
