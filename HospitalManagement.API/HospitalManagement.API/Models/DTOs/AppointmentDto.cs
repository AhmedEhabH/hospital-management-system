namespace HospitalManagement.API.Models.DTOs
{
    public class AppointmentDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // e.g., "Scheduled", "Completed", "Cancelled"
        public string Notes { get; set; } = string.Empty;
    }

    public class CreateAppointmentDto
    {
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public DateTime StartTime { get; set; }
        public int DurationInMinutes { get; set; } = 30; // Default duration
        public string Title { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class DoctorAvailabilityDto
    {
        public int DoctorId { get; set; }
        public List<TimeSlot> AvailableSlots { get; set; } = new List<TimeSlot>();
    }

    public class TimeSlot
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
