using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using Serilog;

namespace HospitalManagement.API.Services.Implementations
{
    public class LabReportService : ILabReportService
    {
        private readonly ILabReportRepository _labReportRepository;
        private readonly IMapper _mapper;
        private readonly Serilog.ILogger _logger;

        public LabReportService(ILabReportRepository labReportRepository, IMapper mapper)
        {
            _labReportRepository = labReportRepository;
            _mapper = mapper;
            _logger = Log.ForContext<LabReportService>();
        }

        public async Task<IEnumerable<LabReportDto>> GetLabReportsByPatientIdAsync(int patientId)
        {
            _logger.Information("Fetching lab reports for PatientId: {PatientId}", patientId);
            var reports = await _labReportRepository.GetByPatientIdAsync(patientId);
            return _mapper.Map<IEnumerable<LabReportDto>>(reports);
        }

        public async Task<LabReportDto?> GetLabReportByIdAsync(int id)
        {
            _logger.Information("Fetching lab report with Id: {Id}", id);
            var report = await _labReportRepository.GetByIdAsync(id);
            return report == null ? null : _mapper.Map<LabReportDto>(report);
        }

        public async Task<LabReportDto> AddLabReportAsync(LabReportDto dto)
        {
            _logger.Information("Adding new lab report for PatientId: {PatientId}", dto.PatientId);
            var entity = _mapper.Map<LabReport>(dto);
            await _labReportRepository.AddAsync(entity);
            await _labReportRepository.SaveChangesAsync();
            return _mapper.Map<LabReportDto>(entity);
        }

        public async Task<bool> UpdateLabReportAsync(int id, LabReportDto dto)
        {
            _logger.Information("Updating lab report with Id: {Id}", id);
            var entity = await _labReportRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Lab report not found for Id: {Id}", id);
                return false;
            }
            _mapper.Map(dto, entity);
            _labReportRepository.Update(entity);
            await _labReportRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteLabReportAsync(int id)
        {
            _logger.Information("Deleting lab report with Id: {Id}", id);
            var entity = await _labReportRepository.GetByIdAsync(id);
            if (entity == null)
            {
                _logger.Warning("Lab report not found for Id: {Id}", id);
                return false;
            }
            _labReportRepository.Remove(entity);
            await _labReportRepository.SaveChangesAsync();
            return true;
        }
    }
}
