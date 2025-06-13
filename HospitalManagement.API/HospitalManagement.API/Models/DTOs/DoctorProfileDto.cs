using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.DTOs
{
    public class DoctorProfileDto
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required(ErrorMessage = "Hospital Name is required")]
        [StringLength(100, ErrorMessage = "Hospital Name cannot exceed 100 characters")]
        public string HospitalName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Qualification is required")]
        [StringLength(100, ErrorMessage = "Qualification cannot exceed 100 characters")]
        public string Qualification { get; set; } = string.Empty;

        [Range(0, 50, ErrorMessage = "Experience must be between 0 and 50 years")]
        public int Experience { get; set; }

        [Required(ErrorMessage = "Specialist field is required")]
        [StringLength(100, ErrorMessage = "Specialist field cannot exceed 100 characters")]
        public string SpecialistIn { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
