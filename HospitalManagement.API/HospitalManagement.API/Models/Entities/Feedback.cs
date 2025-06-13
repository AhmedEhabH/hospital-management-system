using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.Entities
{
    public class Feedback
    {
        [Key]
        public int Id { get; set; }

        [Required, ForeignKey("User")]
        public int UserId { get; set; }

        [Required, StringLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(100)]
        public string EmailId { get; set; } = string.Empty;

        [Required, StringLength(2000)]
        public string Comments { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User User { get; set; } = null!;
    }
}
