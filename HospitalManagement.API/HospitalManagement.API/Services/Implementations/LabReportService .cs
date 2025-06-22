using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;

namespace HospitalManagement.API.Services.Implementations
{
    public class LabReportService : ILabReportService, IDisposable
    {
        private readonly ILabReportRepository _labReportRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<LabReportService> _logger;
        private bool _disposed = false;

        public LabReportService(
            ILabReportRepository labReportRepository,
            IMapper mapper,
            ILogger<LabReportService> logger)
        {
            _labReportRepository = labReportRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<LabReportDto> CreateLabReportAsync(LabReportDto labReportDto)
        {
            try
            {
                var labReport = _mapper.Map<LabReport>(labReportDto);
                labReport.CreatedAt = DateTime.UtcNow;
                labReport.TestedDate = DateTime.UtcNow;

                var createdLabReport = await _labReportRepository.AddAsync(labReport);
                var result = _mapper.Map<LabReportDto>(createdLabReport);

                _logger.LogInformation($"Lab report created with ID: {createdLabReport.Id}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating lab report");
                throw;
            }
        }

        public async Task<LabReportDto?> GetLabReportByIdAsync(int id)
        {
            try
            {
                var labReport = await _labReportRepository.GetByIdAsync(id);
                return labReport != null ? _mapper.Map<LabReportDto>(labReport) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting lab report by id: {id}");
                throw;
            }
        }

        public async Task<IEnumerable<LabReportDto>> GetLabReportsByPatientIdAsync(int patientId)
        {
            try
            {
                var labReports = await _labReportRepository.GetByPatientIdAsync(patientId);
                return _mapper.Map<IEnumerable<LabReportDto>>(labReports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting lab reports for patient: {patientId}");
                throw;
            }
        }

        public async Task UpdateLabReportAsync(LabReportDto labReportDto)
        {
            try
            {
                var labReport = _mapper.Map<LabReport>(labReportDto);
                await _labReportRepository.Update(labReport);
                _logger.LogInformation($"Lab report updated with ID: {labReport.Id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating lab report with ID: {labReportDto.Id}");
                throw;
            }
        }

        public async Task DeleteLabReportAsync(int id)
        {
            try
            {
                await _labReportRepository.DeleteAsync(id);
                _logger.LogInformation($"Lab report deleted with ID: {id}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting lab report with ID: {id}");
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

        public async Task<IEnumerable<LabReportDto>> GetCriticalLabReportsAsync()
        {
            try
            {
                var criticalReports = await _labReportRepository.GetCriticalAsync();
                return _mapper.Map<IEnumerable<LabReportDto>>(criticalReports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching critical lab reports");
                throw;
            }
        }

    }
}
