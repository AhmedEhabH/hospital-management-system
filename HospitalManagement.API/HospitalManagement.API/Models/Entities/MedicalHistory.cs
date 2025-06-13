using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace HospitalManagement.API.Models.Entities
{
    public class MedicalHistory
    {
        [Key]
        public int Id { get; set; }

        [Required, ForeignKey("User")]
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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual User User { get; set; } = null!;
    }
}
