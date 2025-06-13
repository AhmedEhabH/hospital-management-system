using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using Serilog;

namespace HospitalManagement.API.Services.Implementations
{
    public class MedicalHistoryService : IMedicalHistoryService
    {
        private readonly IMedicalHistoryRepository _medicalHistoryRepository;
        private readonly IMapper _mapper;
        private readonly Serilog.ILogger _logger;

        public MedicalHistoryService(
            IMedicalHistoryRepository medicalHistoryRepository,
            IMapper mapper)
        {
            _medicalHistoryRepository = medicalHistoryRepository;
            _mapper = mapper;
            _logger = Log.ForContext<MedicalHistoryService>();
        }

        public async Task<IEnumerable<MedicalHistoryDto>> GetMedicalHistoriesByUserIdAsync(int userId)
        {
            _logger.Information("Fetching medical histories for UserId: {UserId}", userId);
            var histories = await _medicalHistoryRepository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<MedicalHistoryDto>>(histories);
        }

        public async Task<MedicalHistoryDto?> GetMedicalHistoryByIdAsync(int id)
        {
            _logger.Information("Fetching medical history with Id: {Id}", id);
            var history = await _medicalHistoryRepository.GetByIdAsync(id);
            return history == null ? null : _mapper.Map<MedicalHistoryDto>(history);
        }

        public async Task<MedicalHistoryDto> AddMedicalHistoryAsync(MedicalHistoryDto dto)
        {
            _logger.Information("Adding new medical history for UserId: {UserId}", dto.UserId);
            var entity = _mapper.Map<MedicalHistory>(dto);
            await _medicalHistoryRepository.AddAsync(entity);
            await _medicalHistoryRepository.SaveChangesAsync();
            return _mapper.Map<MedicalHistoryDto>(entity);
        }

        public async Task<bool> UpdateMedicalHistoryAsync(int id, MedicalHistoryDto dto)
        {
            _logger.Information("Updating medical history with Id: {Id}", id);
            var entity = await _medicalHistoryRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Medical history not found for Id: {Id}", id);
                return false;
            }
            _mapper.Map(dto, entity);
            _medicalHistoryRepository.Update(entity);
            await _medicalHistoryRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteMedicalHistoryAsync(int id)
        {
            _logger.Information("Deleting medical history with Id: {Id}", id);
            var entity = await _medicalHistoryRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Medical history not found for Id: {Id}", id);
                return false;
            }
            _medicalHistoryRepository.Remove(entity);
            await _medicalHistoryRepository.SaveChangesAsync();
            return true;
        }
    }
}
