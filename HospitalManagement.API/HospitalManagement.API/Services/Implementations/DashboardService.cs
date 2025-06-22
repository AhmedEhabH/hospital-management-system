using AutoMapper;
using HospitalManagement.API.Data;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly HospitalDbContext _context;
        private readonly IUserRepository _userRepository;
        private readonly ILabReportRepository _labReportRepository;
        private readonly IMedicalHistoryRepository _medicalHistoryRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IFeedbackRepository _feedbackRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<DashboardService> _logger;

        public DashboardService(
            HospitalDbContext context,
            IUserRepository userRepository,
            ILabReportRepository labReportRepository,
            IMedicalHistoryRepository medicalHistoryRepository,
            IMessageRepository messageRepository,
            IFeedbackRepository feedbackRepository,
            IMapper mapper,
            ILogger<DashboardService> logger)
        {
            _context = context;
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
                var messages = await _messageRepository.GetInboxAsync(patientId);

                // Get real appointments data
                var upcomingAppointments = await _context.Appointments
                    .Where(a => a.PatientId == patientId && a.Date >= DateTime.Today)
                    .OrderBy(a => a.Date)
                    .ThenBy(a => a.Time)
                    .Take(10)
                    .ToListAsync();

                // Get latest health metrics
                var latestHealthMetrics = await _context.HealthMetrics
                    .Where(h => h.PatientId == patientId)
                    .OrderByDescending(h => h.RecordedDate)
                    .Take(5)
                    .ToListAsync();

                var healthMetrics = latestHealthMetrics.FirstOrDefault();
                var healthMetricsDto = healthMetrics != null ? new HealthMetricsDto
                {
                    BloodPressure = new BloodPressureDto
                    {
                        Systolic = healthMetrics.BloodPressureSystolic,
                        Diastolic = healthMetrics.BloodPressureDiastolic,
                        Status = GetBloodPressureStatus(healthMetrics.BloodPressureSystolic, healthMetrics.BloodPressureDiastolic)
                    },
                    HeartRate = new HeartRateDto
                    {
                        Value = healthMetrics.HeartRate,
                        Status = GetHeartRateStatus(healthMetrics.HeartRate)
                    },
                    Weight = new WeightDto
                    {
                        Value = healthMetrics.Weight,
                        Unit = "kg",
                        Trend = CalculateWeightTrend(latestHealthMetrics)
                    },
                    Temperature = new TemperatureDto
                    {
                        Value = healthMetrics.Temperature,
                        Unit = "°C",
                        Status = GetTemperatureStatus(healthMetrics.Temperature)
                    }
                } : new HealthMetricsDto
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
                    UpcomingAppointments = _mapper.Map<List<AppointmentDto>>(upcomingAppointments),
                    HealthMetrics = healthMetricsDto
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
                var pendingMessages = await _messageRepository.GetInboxAsync(doctorId);

                // Get real today's appointments
                var todayAppointments = await _context.Appointments
                    .Where(a => a.DoctorId == doctorId && a.Date.Date == DateTime.Today)
                    .OrderBy(a => a.Time)
                    .ToListAsync();

                // Get doctor's patients from appointments
                var doctorPatientIds = await _context.Appointments
                    .Where(a => a.DoctorId == doctorId)
                    .Select(a => a.PatientId)
                    .Distinct()
                    .ToListAsync();

                var doctorPatients = await _context.Users
                    .Where(u => doctorPatientIds.Contains(u.Id))
                    .Take(20)
                    .ToListAsync();

                var departmentStats = new DepartmentStatsDto
                {
                    TotalPatients = doctorPatients.Count,
                    TodayAppointments = todayAppointments.Count,
                    PendingReports = await _labReportRepository.GetCriticalCountAsync(),
                    CriticalCases = criticalLabReports.Count()
                };

                return new DoctorDashboardDto
                {
                    UserInfo = _mapper.Map<UserInfoDto>(user),
                    Patients = _mapper.Map<List<UserInfoDto>>(doctorPatients),
                    TodayAppointments = _mapper.Map<List<AppointmentDto>>(todayAppointments),
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

        // Get real user activities for admin dashboard
        public async Task<List<UserActivityDto>> GetRecentUserActivitiesAsync(int limit = 20)
        {
            try
            {
                var activities = await _context.UserActivities
                    .OrderByDescending(a => a.Timestamp)
                    .Take(limit)
                    .ToListAsync();

                return _mapper.Map<List<UserActivityDto>>(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user activities");
                throw;
            }
        }

        public async Task<List<AppointmentDto>> GetTodayAppointmentsByDoctorAsync(int doctorId)
        {
            try
            {
                var appointments = await _context.Appointments
                    .Where(a => a.DoctorId == doctorId && a.Date.Date == DateTime.Today)
                    .OrderBy(a => a.Time)
                    .ToListAsync();

                return _mapper.Map<List<AppointmentDto>>(appointments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching today's appointments for doctor ID: {DoctorId}", doctorId);
                throw;
            }
        }

        public async Task<List<HealthMetricsDto>> GetPatientHealthTrendsAsync(int patientId, int days = 30)
        {
            try
            {
                var startDate = DateTime.UtcNow.AddDays(-days);
                var healthMetrics = await _context.HealthMetrics
                    .Where(h => h.PatientId == patientId && h.RecordedDate >= startDate)
                    .OrderBy(h => h.RecordedDate)
                    .ToListAsync();

                return healthMetrics.Select(h => new HealthMetricsDto
                {
                    BloodPressure = new BloodPressureDto
                    {
                        Systolic = h.BloodPressureSystolic,
                        Diastolic = h.BloodPressureDiastolic,
                        Status = GetBloodPressureStatus(h.BloodPressureSystolic, h.BloodPressureDiastolic)
                    },
                    HeartRate = new HeartRateDto
                    {
                        Value = h.HeartRate,
                        Status = GetHeartRateStatus(h.HeartRate)
                    },
                    Weight = new WeightDto
                    {
                        Value = h.Weight,
                        Unit = "kg",
                        Trend = "stable"
                    },
                    Temperature = new TemperatureDto
                    {
                        Value = h.Temperature,
                        Unit = "°C",
                        Status = GetTemperatureStatus(h.Temperature)
                    }
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching health trends for patient ID: {PatientId}", patientId);
                throw;
            }
        }

        private string GetBloodPressureStatus(int systolic, int diastolic)
        {
            if (systolic >= 140 || diastolic >= 90) return "High";
            if (systolic <= 90 || diastolic <= 60) return "Low";
            return "Normal";
        }

        private string GetHeartRateStatus(int heartRate)
        {
            if (heartRate > 100) return "High";
            if (heartRate < 60) return "Low";
            return "Normal";
        }

        private string GetTemperatureStatus(decimal temperature)
        {
            if (temperature >= 38.0m) return "Fever";
            if (temperature <= 36.0m) return "Low";
            return "Normal";
        }

        private string CalculateWeightTrend(List<HealthMetric> metrics)
        {
            if (metrics.Count < 2) return "stable";

            var recent = metrics.Take(2).OrderByDescending(m => m.RecordedDate).ToList();
            var difference = recent[0].Weight - recent[1].Weight;

            if (difference > 1) return "increasing";
            if (difference < -1) return "decreasing";
            return "stable";
        }
    }
}
