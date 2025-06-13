using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.DTOs
{
    public class MedicalHistoryDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        [StringLength(500)]
        public string? PersonalHistory { get; set; }

        [StringLength(500)]
        public string? FamilyHistory { get; set; }

        [StringLength(500)]
        public string? Allergies { get; set; }

        [StringLength(500)]
        public string? FrequentlyOccurringDisease { get; set; }

        public bool HasAsthma { get; set; }
        public bool HasBloodPressure { get; set; }
        public bool HasCholesterol { get; set; }
        public bool HasDiabetes { get; set; }
        public bool HasHeartDisease { get; set; }

        public bool UsesTobacco { get; set; }
        public int CigarettePacksPerDay { get; set; }
        public int SmokingYears { get; set; }

        public bool DrinksAlcohol { get; set; }
        public int AlcoholicDrinksPerWeek { get; set; }

        [StringLength(500)]
        public string? CurrentMedications { get; set; }
    }
}
