using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalPatients { get; set; }
        public int TotalDoctors { get; set; }
        public int TotalAdmins { get; set; } // NEW
        public int TotalUsers { get; set; }  // NEW
        public int ActiveUsers { get; set; } // NEW
        public int TotalLabReports { get; set; }
        public int CriticalAlerts { get; set; }
        public int PendingMessages { get; set; }
        public int RecentFeedback { get; set; }

        // **STEP 5: Add new system metrics properties**
        public string SystemUptime { get; set; } = string.Empty;
        public double ServerLoad { get; set; }
        public string DatabaseSize { get; set; } = string.Empty;
        public int DailyLogins { get; set; }
        public int MonthlyRegistrations { get; set; }

        public DateTime LastUpdated { get; set; }
    }

    public class PatientDashboardDto
    {
        public UserInfoDto UserInfo { get; set; } = new();
        public List<MedicalHistoryDto> MedicalHistory { get; set; } = new();
        public List<LabReportDto> LabReports { get; set; } = new();
        public List<MessageDto> Messages { get; set; } = new();
        public List<AppointmentDto> UpcomingAppointments { get; set; } = new();
        public HealthMetricsDto HealthMetrics { get; set; } = new();
    }

    public class DoctorDashboardDto
    {
        public UserInfoDto UserInfo { get; set; } = new();
        public List<UserInfoDto> Patients { get; set; } = new();
        public List<AppointmentDto> TodayAppointments { get; set; } = new();
        public List<LabReportDto> CriticalLabReports { get; set; } = new();
        public List<MessageDto> PendingMessages { get; set; } = new();
        public DepartmentStatsDto DepartmentStats { get; set; } = new();
    }

    public class HealthMetricsDto
    {
        public BloodPressureDto BloodPressure { get; set; } = new();
        public HeartRateDto HeartRate { get; set; } = new();
        public WeightDto Weight { get; set; } = new();
        public TemperatureDto Temperature { get; set; } = new();
    }

    public class BloodPressureDto
    {
        public int Systolic { get; set; }
        public int Diastolic { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class HeartRateDto
    {
        public int Value { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class WeightDto
    {
        public decimal Value { get; set; }
        public string Unit { get; set; } = "kg";
        public string Trend { get; set; } = string.Empty;
    }

    public class TemperatureDto
    {
        public decimal Value { get; set; }
        public string Unit { get; set; } = "°C";
        public string Status { get; set; } = string.Empty;
    }

    public class DepartmentStatsDto
    {
        public int TotalPatients { get; set; }
        public int TodayAppointments { get; set; }
        public int PendingReports { get; set; }
        public int CriticalCases { get; set; }
    }

    // Placeholder for future appointment implementation
    //public class AppointmentDto
    //{
    //    public int Id { get; set; }
    //    public string DoctorName { get; set; } = string.Empty;
    //    public string PatientName { get; set; } = string.Empty;
    //    public DateTime Date { get; set; }
    //    public string Time { get; set; } = string.Empty;
    //    public string Department { get; set; } = string.Empty;
    //    public string Type { get; set; } = string.Empty;
    //    public string Status { get; set; } = string.Empty;
    //}
}
