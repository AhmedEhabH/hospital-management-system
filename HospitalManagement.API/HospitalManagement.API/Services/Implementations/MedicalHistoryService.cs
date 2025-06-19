using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;

namespace HospitalManagement.API.Services.Implementations
{
    public class MedicalHistoryService : IMedicalHistoryService, IDisposable
    {
        private readonly IMedicalHistoryRepository _medicalHistoryRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<MedicalHistoryService> _logger;
        private bool _disposed = false;

        public MedicalHistoryService(
            IMedicalHistoryRepository medicalHistoryRepository,
            IMapper mapper,
            ILogger<MedicalHistoryService> logger)
        {
            _medicalHistoryRepository = medicalHistoryRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<MedicalHistoryDto> CreateMedicalHistoryAsync(MedicalHistoryDto medicalHistoryDto)
        {
            try
            {
                var medicalHistory = _mapper.Map<MedicalHistory>(medicalHistoryDto);

                var createdMedicalHistory = await _medicalHistoryRepository.AddAsync(medicalHistory);
                var result = _mapper.Map<MedicalHistoryDto>(createdMedicalHistory);

                _logger.LogInformation($"Medical history created with ID: {createdMedicalHistory.Id}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating medical history");
                throw;
            }
        }

        public async Task<MedicalHistoryDto?> GetMedicalHistoryByIdAsync(int id)
        {
            try
            {
                var medicalHistory = await _medicalHistoryRepository.GetByIdAsync(id);
                return medicalHistory != null ? _mapper.Map<MedicalHistoryDto>(medicalHistory) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting medical history by id: {id}");
                throw;
            }
        }

        public async Task<IEnumerable<MedicalHistoryDto>> GetMedicalHistoryByUserIdAsync(int userId)
        {
            try
            {
                var medicalHistories = await _medicalHistoryRepository.GetByUserIdAsync(userId);
                return _mapper.Map<IEnumerable<MedicalHistoryDto>>(medicalHistories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting medical history for user: {userId}");
                throw;
            }
        }

        public async Task UpdateMedicalHistoryAsync(MedicalHistoryDto medicalHistoryDto)
        {
            try
            {
                var medicalHistory = _mapper.Map<MedicalHistory>(medicalHistoryDto);
                await _medicalHistoryRepository.Update(medicalHistory);
                _logger.LogInformation($"Medical history updated with ID: {medicalHistory.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating medical history with ID: {medicalHistoryDto.Id}");
                throw;
            }
        }

        public async Task DeleteMedicalHistoryAsync(int id)
        {
            try
            {
                await _medicalHistoryRepository.DeleteAsync(id);
                _logger.LogInformation($"Medical history deleted with ID: {id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting medical history with ID: {id}");
                throw;
            }
        }

        // ADDED: IDisposable implementation
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // Dispose managed resources if any
                    // Note: In this case, we don't have any disposable resources to clean up
                    // but this pattern is here for future extensibility
                }
                _disposed = true;
            }
        }
    }
}
