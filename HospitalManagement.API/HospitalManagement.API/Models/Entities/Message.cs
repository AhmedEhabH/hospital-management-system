using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.Entities
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required, ForeignKey("Sender")]
        public int SenderId { get; set; }

        [Required, ForeignKey("Receiver")]
        public int ReceiverId { get; set; }

        [Required, StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required, StringLength(2000)]
        public string MessageContent { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;
        public DateTime SentDate { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User Sender { get; set; } = null!;
        public virtual User Receiver { get; set; } = null!;
    }
}
