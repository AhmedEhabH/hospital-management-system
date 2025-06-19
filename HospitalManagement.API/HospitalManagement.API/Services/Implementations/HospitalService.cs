using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;

namespace HospitalManagement.API.Services.Implementations
{
    public class HospitalService : IHospitalService
    {
        private readonly IGenericRepository<HospitalInfo> _hospitalRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<HospitalService> _logger;

        public HospitalService(
            IGenericRepository<HospitalInfo> hospitalRepository,
            IMapper mapper,
            ILogger<HospitalService> logger)
        {
            _hospitalRepository = hospitalRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<HospitalInfoDto> CreateHospitalInfoAsync(HospitalInfoDto hospitalInfoDto)
        {
            try
            {
                var hospitalInfo = _mapper.Map<HospitalInfo>(hospitalInfoDto);
                hospitalInfo.CreatedAt = DateTime.UtcNow;
                hospitalInfo.UpdatedAt = DateTime.UtcNow;

                // FIXED: Use AddAsync method
                var createdHospitalInfo = await _hospitalRepository.AddAsync(hospitalInfo);
                var result = _mapper.Map<HospitalInfoDto>(createdHospitalInfo);

                _logger.LogInformation($"Hospital info created with ID: {createdHospitalInfo.Id}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating hospital info");
                throw;
            }
        }

        public async Task<HospitalInfoDto?> GetHospitalInfoByIdAsync(int id)
        {
            try
            {
                var hospitalInfo = await _hospitalRepository.GetByIdAsync(id);
                return hospitalInfo != null ? _mapper.Map<HospitalInfoDto>(hospitalInfo) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting hospital info by id: {id}");
                throw;
            }
        }

        public async Task<IEnumerable<HospitalInfoDto>> GetAllHospitalInfoAsync()
        {
            try
            {
                var hospitalInfos = await _hospitalRepository.GetAllAsync();
                return _mapper.Map<IEnumerable<HospitalInfoDto>>(hospitalInfos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all hospital info");
                throw;
            }
        }

        public async Task UpdateHospitalInfoAsync(HospitalInfoDto hospitalInfoDto)
        {
            try
            {
                var hospitalInfo = _mapper.Map<HospitalInfo>(hospitalInfoDto);
                hospitalInfo.UpdatedAt = DateTime.UtcNow;

                // FIXED: Use Update method
                await _hospitalRepository.Update(hospitalInfo);
                _logger.LogInformation($"Hospital info updated with ID: {hospitalInfo.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating hospital info with ID: {hospitalInfoDto.Id}");
                throw;
            }
        }

        public async Task DeleteHospitalInfoAsync(int id)
        {
            try
            {
                await _hospitalRepository.DeleteAsync(id);
                _logger.LogInformation($"Hospital info deleted with ID: {id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting hospital info with ID: {id}");
                throw;
            }
        }
    }
}
