using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.DTOs
{
    public class LoginDto
    {
        [Required, StringLength(50)]
        public string UserId { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Password { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string UserType { get; set; } = string.Empty;
    }
}
