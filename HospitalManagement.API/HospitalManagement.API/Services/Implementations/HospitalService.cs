using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using AutoMapper;
using Serilog;

namespace HospitalManagement.API.Services.Implementations
{
    public class HospitalService : IHospitalService
    {
        private readonly IGenericRepository<HospitalInfo> _hospitalInfoRepository;
        private readonly IMapper _mapper;
        private readonly Serilog.ILogger _logger;

        public HospitalService(IGenericRepository<HospitalInfo> hospitalInfoRepository, IMapper mapper)
        {
            _hospitalInfoRepository = hospitalInfoRepository;
            _mapper = mapper;
            _logger = Log.ForContext<HospitalService>();
        }

        public async Task<IEnumerable<HospitalInfoDto>> GetAllHospitalInfosAsync()
        {
            _logger.Information("Fetching all hospital information records.");
            var infos = await _hospitalInfoRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<HospitalInfoDto>>(infos);
        }

        public async Task<HospitalInfoDto?> GetHospitalInfoByIdAsync(int id)
        {
            _logger.Information("Fetching hospital information with Id: {Id}", id);
            var info = await _hospitalInfoRepository.GetByIdAsync(id);
            return info == null ? null : _mapper.Map<HospitalInfoDto>(info);
        }

        public async Task<HospitalInfoDto> AddHospitalInfoAsync(HospitalInfoDto dto)
        {
            _logger.Information("Adding new hospital information.");
            var entity = _mapper.Map<HospitalInfo>(dto);
            await _hospitalInfoRepository.AddAsync(entity);
            await _hospitalInfoRepository.SaveChangesAsync();
            return _mapper.Map<HospitalInfoDto>(entity);
        }

        public async Task<bool> UpdateHospitalInfoAsync(int id, HospitalInfoDto dto)
        {
            _logger.Information("Updating hospital information with Id: {Id}", id);
            var entity = await _hospitalInfoRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Hospital information not found for Id: {Id}", id);
                return false;
            }
            _mapper.Map(dto, entity);
            _hospitalInfoRepository.Update(entity);
            await _hospitalInfoRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteHospitalInfoAsync(int id)
        {
            _logger.Information("Deleting hospital information with Id: {Id}", id);
            var entity = await _hospitalInfoRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Hospital information not found for Id: {Id}", id);
                return false;
            }
            _hospitalInfoRepository.Remove(entity);
            await _hospitalInfoRepository.SaveChangesAsync();
            return true;
        }
    }
}
