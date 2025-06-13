﻿namespace HospitalManagement.API.Models.DTOs
{
    public class RegistrationResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? UserId { get; set; }
    }
}
