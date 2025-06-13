using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.Entities
{
    public class HospitalInfo
    {
        [Key]
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string HospitalName { get; set; } = string.Empty;

        [Required, StringLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string City { get; set; } = string.Empty;

        [StringLength(15)]
        public string? PhoneNumber { get; set; }

        [EmailAddress, StringLength(100)]
        public string? Email { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
