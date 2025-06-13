using System;

namespace HospitalManagement.API.Models.DTOs
{
    public class HospitalInfoDto
    {
        public int Id { get; set; }

        public string HospitalName { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? Email { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
