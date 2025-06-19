using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IFeedbackService
    {
        // FIXED: Match method names with implementation
        Task<FeedbackDto> CreateFeedbackAsync(FeedbackDto feedbackDto);
        Task<FeedbackDto?> GetFeedbackByIdAsync(int id);
        Task<IEnumerable<FeedbackDto>> GetFeedbackByUserIdAsync(int userId);
        Task UpdateFeedbackAsync(FeedbackDto feedbackDto);
        Task DeleteFeedbackAsync(int id);
    }
}
