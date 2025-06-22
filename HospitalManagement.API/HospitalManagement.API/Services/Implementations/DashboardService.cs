using HospitalManagement.API.Services.Interfaces;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Repositories.Interfaces;
using AutoMapper;

namespace HospitalManagement.API.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILabReportRepository _labReportRepository;
        private readonly IMedicalHistoryRepository _medicalHistoryRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IFeedbackRepository _feedbackRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(
            IUserRepository userRepository,
            ILabReportRepository labReportRepository,
            IMedicalHistoryRepository medicalHistoryRepository,
            IMessageRepository messageRepository,
            IFeedbackRepository feedbackRepository,
            IMapper mapper,
            ILogger<DashboardService> logger)
        {
            _userRepository = userRepository;
            _labReportRepository = labReportRepository;
            _medicalHistoryRepository = medicalHistoryRepository;
            _messageRepository = messageRepository;
            _feedbackRepository = feedbackRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<DashboardStatsDto> GetSystemStatsAsync()
        {
            try
            {
                _logger.LogInformation("Calculating system dashboard statistics");

                var totalPatients = await _userRepository.CountByUserTypeAsync("Patient");
                var totalDoctors = await _userRepository.CountByUserTypeAsync("Doctor");
                var totalLabReports = await _labReportRepository.GetTotalCountAsync();
                var criticalAlerts = await _labReportRepository.GetCriticalCountAsync();
                var pendingMessages = await _messageRepository.GetUnreadCountAsync();
                var recentFeedback = await _feedbackRepository.GetRecentCountAsync(30);

                return new DashboardStatsDto
                {
                    TotalPatients = totalPatients,
                    TotalDoctors = totalDoctors,
                    TotalLabReports = totalLabReports,
                    CriticalAlerts = criticalAlerts,
                    PendingMessages = pendingMessages,
                    RecentFeedback = recentFeedback,
                    LastUpdated = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating system statistics");
                throw;
            }
        }

        public async Task<PatientDashboardDto?> GetPatientDashboardAsync(int patientId)
        {
            try
            {
                _logger.LogInformation("Fetching patient dashboard data for patient ID: {PatientId}", patientId);

                var user = await _userRepository.GetByIdAsync(patientId);
                if (user == null || user.UserType != "Patient")
                {
                    return null;
                }

                var medicalHistory = await _medicalHistoryRepository.GetByUserIdAsync(patientId);
                var labReports = await _labReportRepository.GetByPatientIdAsync(patientId);
                // FIXED: Use correct method name
                var messages = await _messageRepository.GetInboxAsync(patientId);

                var healthMetrics = new HealthMetricsDto
                {
                    BloodPressure = new BloodPressureDto { Systolic = 120, Diastolic = 80, Status = "Normal" },
                    HeartRate = new HeartRateDto { Value = 72, Status = "Normal" },
                    Weight = new WeightDto { Value = 70, Unit = "kg", Trend = "stable" },
                    Temperature = new TemperatureDto { Value = 36.5m, Unit = "°C", Status = "Normal" }
                };

                return new PatientDashboardDto
                {
                    UserInfo = _mapper.Map<UserInfoDto>(user),
                    MedicalHistory = _mapper.Map<List<MedicalHistoryDto>>(medicalHistory),
                    LabReports = _mapper.Map<List<LabReportDto>>(labReports),
                    Messages = _mapper.Map<List<MessageDto>>(messages),
                    UpcomingAppointments = new List<AppointmentDto>(),
                    HealthMetrics = healthMetrics
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching patient dashboard for patient ID: {PatientId}", patientId);
                throw;
            }
        }

        public async Task<DoctorDashboardDto?> GetDoctorDashboardAsync(int doctorId)
        {
            try
            {
                _logger.LogInformation("Fetching doctor dashboard data for doctor ID: {DoctorId}", doctorId);

                var user = await _userRepository.GetByIdAsync(doctorId);
                if (user == null || user.UserType != "Doctor")
                {
                    return null;
                }

                var criticalLabReports = await _labReportRepository.GetCriticalAsync();
                // FIXED: Use correct method name
                var pendingMessages = await _messageRepository.GetInboxAsync(doctorId);

                var departmentStats = new DepartmentStatsDto
                {
                    TotalPatients = 45,
                    TodayAppointments = 8,
                    PendingReports = 3,
                    CriticalCases = criticalLabReports.Count()
                };

                return new DoctorDashboardDto
                {
                    UserInfo = _mapper.Map<UserInfoDto>(user),
                    Patients = new List<UserInfoDto>(),
                    TodayAppointments = new List<AppointmentDto>(),
                    CriticalLabReports = _mapper.Map<List<LabReportDto>>(criticalLabReports),
                    PendingMessages = _mapper.Map<List<MessageDto>>(pendingMessages),
                    DepartmentStats = departmentStats
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching doctor dashboard for doctor ID: {DoctorId}", doctorId);
                throw;
            }
        }
    }
}
