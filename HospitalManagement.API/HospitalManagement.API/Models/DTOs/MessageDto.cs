using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.DTOs
{
    public class MessageDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }

        [Required, StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required, StringLength(2000)]
        public string MessageContent { get; set; } = string.Empty;

        public bool IsRead { get; set; }
        public DateTime SentDate { get; set; }
    }
}
