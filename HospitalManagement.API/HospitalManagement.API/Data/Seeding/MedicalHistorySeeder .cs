using HospitalManagement.API.Models.Entities;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class MedicalHistorySeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            if (!context.MedicalHistories.Any())
            {
                Log.Information("Seeding medical histories...");

                var patientUsers = context.Users.Where(u => u.UserType == "Patient").ToList();

                if (patientUsers.Any())
                {
                    var medicalHistories = new List<MedicalHistory>
                    {
                        new MedicalHistory
                        {
                            UserId = patientUsers.First().Id,
                            PersonalHistory = "No major surgeries. Regular checkups.",
                            FamilyHistory = "Father had diabetes, mother had hypertension",
                            Allergies = "Penicillin, shellfish",
                            FrequentlyOccurringDisease = "Seasonal allergies",
                            HasAsthma = false,
                            HasBloodPressure = true,
                            HasCholesterol = false,
                            HasDiabetes = false,
                            HasHeartDisease = false,
                            UsesTobacco = false,
                            CigarettePacksPerDay = 0,
                            SmokingYears = 0,
                            DrinksAlcohol = false,
                            AlcoholicDrinksPerWeek = 0,
                            CurrentMedications = "Lisinopril 10mg daily",
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    context.MedicalHistories.AddRange(medicalHistories);
                    await context.SaveChangesAsync();
                    Log.Information("Medical histories seeded successfully.");
                }
            }
        }
    }
}