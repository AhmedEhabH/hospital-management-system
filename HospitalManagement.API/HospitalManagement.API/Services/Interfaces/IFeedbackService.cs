using HospitalManagement.API.Models.DTOs;

namespace HospitalManagement.API.Services.Interfaces
{
    public interface IFeedbackService
    {
        Task<IEnumerable<FeedbackDto>> GetFeedbacksByUserIdAsync(int userId);
        Task<FeedbackDto?> GetFeedbackByIdAsync(int id);
        Task<FeedbackDto> AddFeedbackAsync(FeedbackDto dto);
        Task<bool> UpdateFeedbackAsync(int id, FeedbackDto dto);
        Task<bool> DeleteFeedbackAsync(int id);
    }
}
