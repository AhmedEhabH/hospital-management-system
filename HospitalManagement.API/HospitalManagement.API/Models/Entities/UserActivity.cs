using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.Entities
{
    public class UserActivity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string UserType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Action { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; }

        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty;

        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}
