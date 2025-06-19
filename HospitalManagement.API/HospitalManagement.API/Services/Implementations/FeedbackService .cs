using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;

namespace HospitalManagement.API.Services.Implementations
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _feedbackRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<FeedbackService> _logger;

        public FeedbackService(
            IFeedbackRepository feedbackRepository,
            IMapper mapper,
            ILogger<FeedbackService> logger)
        {
            _feedbackRepository = feedbackRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<FeedbackDto> CreateFeedbackAsync(FeedbackDto feedbackDto)
        {
            try
            {
                var feedback = _mapper.Map<Feedback>(feedbackDto);
                feedback.CreatedAt = DateTime.UtcNow;

                // FIXED: Use AddAsync method
                var createdFeedback = await _feedbackRepository.AddAsync(feedback);
                var result = _mapper.Map<FeedbackDto>(createdFeedback);

                _logger.LogInformation($"Feedback created with ID: {createdFeedback.Id}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating feedback");
                throw;
            }
        }

        public async Task<FeedbackDto?> GetFeedbackByIdAsync(int id)
        {
            try
            {
                var feedback = await _feedbackRepository.GetByIdAsync(id);
                return feedback != null ? _mapper.Map<FeedbackDto>(feedback) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting feedback by id: {id}");
                throw;
            }
        }

        public async Task<IEnumerable<FeedbackDto>> GetFeedbackByUserIdAsync(int userId)
        {
            try
            {
                var feedbacks = await _feedbackRepository.GetByUserIdAsync(userId);
                return _mapper.Map<IEnumerable<FeedbackDto>>(feedbacks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting feedback for user: {userId}");
                throw;
            }
        }

        public async Task UpdateFeedbackAsync(FeedbackDto feedbackDto)
        {
            try
            {
                var feedback = _mapper.Map<Feedback>(feedbackDto);
                // FIXED: Use Update method
                await _feedbackRepository.Update(feedback);
                _logger.LogInformation($"Feedback updated with ID: {feedback.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating feedback with ID: {feedbackDto.Id}");
                throw;
            }
        }

        public async Task DeleteFeedbackAsync(int id)
        {
            try
            {
                await _feedbackRepository.DeleteAsync(id);
                _logger.LogInformation($"Feedback deleted with ID: {id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting feedback with ID: {id}");
                throw;
            }
        }
    }
}
