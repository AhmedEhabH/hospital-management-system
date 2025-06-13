using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required, StringLength(10)]
        public string Gender { get; set; } = string.Empty;

        public int Age { get; set; }

        [Required, StringLength(50)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required, StringLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string City { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string State { get; set; } = string.Empty;

        [Required, StringLength(10)]
        public string Zip { get; set; } = string.Empty;

        [Required, StringLength(15)]
        public string PhoneNo { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string UserType { get; set; } = string.Empty; // Admin, Doctor, Patient

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual ICollection<MedicalHistory> MedicalHistories { get; set; } = new List<MedicalHistory>();
        public virtual ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public virtual ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public virtual ICollection<LabReport> LabReports { get; set; } = new List<LabReport>();
        public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
        public virtual DoctorProfile? DoctorProfile { get; set; }
    }
}
