using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagement.API.Models.Entities
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        // Foreign key for Doctor
        public int DoctorId { get; set; }
        [ForeignKey("DoctorId")]
        public User Doctor { get; set; } = null!;

        // Foreign key for Patient
        public int PatientId { get; set; }
        [ForeignKey("PatientId")]
        public User Patient { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string DoctorName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string PatientName { get; set; } = string.Empty;

        // FIXED: Replaced old properties with new ones
        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        //[Required]
        //[MaxLength(10)]
        //public string Time { get; set; } = string.Empty;

        //[MaxLength(50)]
        //public string Department { get; set; } = string.Empty;

        //[MaxLength(50)]
        //public string Type { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // e.g., "Scheduled", "Completed", "Cancelled"

        [StringLength(1000)]
        public string Notes { get; set; } = string.Empty;


        // Navigation properties
        //public virtual User Doctor { get; set; } = null!;
        //public virtual User Patient { get; set; } = null!;
    }
}
