using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.DTOs
{
    public class DoctorProfileDto
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, StringLength(100)]
        public string HospitalName { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Qualification { get; set; } = string.Empty;

        public int Experience { get; set; }

        [Required, StringLength(100)]
        public string SpecialistIn { get; set; } = string.Empty;

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

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // User information
        public string? DoctorName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNo { get; set; }
    }
}
