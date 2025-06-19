using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalManagement.API.Models.Entities
{
    [Table("DoctorProfiles")]
    public class DoctorProfile
    {
        [Key]
        public int Id { get; set; }

        [Required, ForeignKey("User")]
        public int UserId { get; set; }

        [Required, StringLength(100)]
        public string HospitalName { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Qualification { get; set; } = string.Empty;

        public int Experience { get; set; }

        [Required, StringLength(100)]
        public string SpecialistIn { get; set; } = string.Empty;

        // ADDED: Enhanced medical professional properties
        [Required, StringLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Specialization { get; set; }

        [StringLength(500)]
        public string? Biography { get; set; }

        [StringLength(200)]
        public string? Education { get; set; }

        [StringLength(200)]
        public string? Certifications { get; set; }

        [StringLength(100)]
        public string? Department { get; set; }

        [StringLength(50)]
        public string? OfficeLocation { get; set; }

        [StringLength(15)]
        public string? DirectPhone { get; set; }

        [StringLength(100), EmailAddress]
        public string? ProfessionalEmail { get; set; }

        public bool IsAvailableForConsultation { get; set; } = true;

        [Column(TypeName = "decimal(10,2)")]
        public decimal ConsultationFee { get; set; }

        [StringLength(200)]
        public string? WorkingHours { get; set; }

        [StringLength(100)]
        public string? MedicalSchool { get; set; }

        [StringLength(100)]
        public string? Residency { get; set; }

        [StringLength(100)]
        public string? Fellowship { get; set; }

        [StringLength(500)]
        public string? ResearchInterests { get; set; }

        [StringLength(500)]
        public string? Publications { get; set; }

        [StringLength(200)]
        public string? Languages { get; set; }

        public bool AcceptsNewPatients { get; set; } = true;

        public bool AcceptsInsurance { get; set; } = true;

        [StringLength(500)]
        public string? InsuranceAccepted { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual User User { get; set; } = null!;
    }
}
