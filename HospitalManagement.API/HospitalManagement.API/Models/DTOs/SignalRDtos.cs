namespace HospitalManagement.API.Models.DTOs
{
    public class CriticalAlertDto
    {
        public int PatientId { get; set; }
        public int? LabReportId { get; set; }
        public string AlertMessage { get; set; } = string.Empty;
        public string AlertType { get; set; } = string.Empty; // "Critical", "Warning", "Emergency"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string DoctorName { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
    }

    public class AppointmentReminderDto
    {
        public int PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string ReminderMessage { get; set; } = string.Empty;
    }

    public class SystemNotificationDto
    {
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "Info", "Warning", "Maintenance"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Title { get; set; } = string.Empty;
    }

    public class OnlineUserDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public int ConnectionCount { get; set; }
        public DateTime LastSeen { get; set; }
    }
}
