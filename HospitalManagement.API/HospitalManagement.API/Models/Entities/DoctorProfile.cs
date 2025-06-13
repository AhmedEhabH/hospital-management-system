using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.Entities
{
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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual User User { get; set; } = null!;
    }
}
