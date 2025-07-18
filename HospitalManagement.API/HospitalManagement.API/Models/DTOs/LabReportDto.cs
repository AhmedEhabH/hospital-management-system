﻿using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.DTOs
{
    public class LabReportDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }

        [Required, StringLength(100)]
        public string TestedBy { get; set; } = string.Empty;

        [Required, StringLength(200)]
        public string TestPerformed { get; set; } = string.Empty;

        public decimal PhLevel { get; set; }
        public decimal CholesterolLevel { get; set; }
        public decimal SucroseLevel { get; set; }
        public decimal WhiteBloodCellsRatio { get; set; }
        public decimal RedBloodCellsRatio { get; set; }
        public decimal HeartBeatRatio { get; set; }

        [StringLength(1000)]
        public string? Reports { get; set; }

        public DateTime TestedDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
