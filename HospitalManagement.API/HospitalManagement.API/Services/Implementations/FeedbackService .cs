using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using Serilog;

namespace HospitalManagement.API.Services.Implementations
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _feedbackRepository;
        private readonly IMapper _mapper;
        private readonly Serilog.ILogger _logger;

        public FeedbackService(IFeedbackRepository feedbackRepository, IMapper mapper)
        {
            _feedbackRepository = feedbackRepository;
            _mapper = mapper;
            _logger = Log.ForContext<FeedbackService>();
        }

        public async Task<IEnumerable<FeedbackDto>> GetFeedbacksByUserIdAsync(int userId)
        {
            _logger.Information("Fetching feedbacks for UserId: {UserId}", userId);
            var feedbacks = await _feedbackRepository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<FeedbackDto>>(feedbacks);
        }

        public async Task<FeedbackDto?> GetFeedbackByIdAsync(int id)
        {
            _logger.Information("Fetching feedback with Id: {Id}", id);
            var feedback = await _feedbackRepository.GetByIdAsync(id);
            return feedback == null ? null : _mapper.Map<FeedbackDto>(feedback);
        }

        public async Task<FeedbackDto> AddFeedbackAsync(FeedbackDto dto)
        {
            _logger.Information("Adding new feedback for UserId: {UserId}", dto.UserId);
            var entity = _mapper.Map<Feedback>(dto);
            await _feedbackRepository.AddAsync(entity);
            await _feedbackRepository.SaveChangesAsync();
            return _mapper.Map<FeedbackDto>(entity);
        }

        public async Task<bool> UpdateFeedbackAsync(int id, FeedbackDto dto)
        {
            _logger.Information("Updating feedback with Id: {Id}", id);
            var entity = await _feedbackRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Feedback not found for Id: {Id}", id);
                return false;
            }
            _mapper.Map(dto, entity);
            _feedbackRepository.Update(entity);
            await _feedbackRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteFeedbackAsync(int id)
        {
            _logger.Information("Deleting feedback with Id: {Id}", id);
            var entity = await _feedbackRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Feedback not found for Id: {Id}", id);
                return false;
            }
            _feedbackRepository.Remove(entity);
            await _feedbackRepository.SaveChangesAsync();
            return true;
        }
    }
}