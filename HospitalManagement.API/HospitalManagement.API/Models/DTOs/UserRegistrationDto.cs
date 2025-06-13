using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.DTOs
{
    public class UserRegistrationDto
    {
        [Required, StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required, StringLength(10)]
        public string Gender { get; set; } = string.Empty;

        [Range(1, 120)]
        public int Age { get; set; }

        [Required, StringLength(50)]
        public string UserId { get; set; } = string.Empty;

        [Required, StringLength(100), MinLength(6)]
        public string Password { get; set; } = string.Empty;

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
        public string UserType { get; set; } = string.Empty;
    }
}
