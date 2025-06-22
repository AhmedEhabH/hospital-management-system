using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.Entities
{
    public class HealthMetric
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PatientId { get; set; }

        public int BloodPressureSystolic { get; set; }
        public int BloodPressureDiastolic { get; set; }
        public int HeartRate { get; set; }
        public decimal Weight { get; set; }
        public decimal Temperature { get; set; }

        [Required]
        public DateTime RecordedDate { get; set; }

        // Navigation property
        public virtual User Patient { get; set; } = null!;
    }
}
