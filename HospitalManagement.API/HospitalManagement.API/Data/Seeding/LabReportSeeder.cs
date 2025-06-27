using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class LabReportSeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            if (!await context.LabReports.AnyAsync())
            {
                Log.Information("Seeding lab reports...");

                var patients = await context.Users.Where(u => u.UserType == "Patient").ToListAsync();
                var doctors = await context.Users.Where(u => u.UserType == "Doctor").ToListAsync();

                var labReports = new List<LabReport>();

                foreach (var patient in patients)
                {
                    // Generate 3-5 lab reports per patient
                    for (int i = 0; i < Random.Shared.Next(3, 6); i++)
                    {
                        var doctor = doctors[Random.Shared.Next(doctors.Count)];
                        var testDate = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 90));

                        labReports.Add(new LabReport
                        {
                            PatientId = patient.Id,
                            TestedBy = $"Dr. {doctor.FirstName} {doctor.LastName}",
                            TestPerformed = GetRandomTestType(),
                            PhLevel = GetRandomDecimal(6.5, 8.5, 2),
                            CholesterolLevel = GetRandomDecimal(150, 300, 1),
                            SucroseLevel = GetRandomDecimal(70, 200, 1),
                            WhiteBloodCellsRatio = GetRandomDecimal(4000, 15000, 0),
                            RedBloodCellsRatio = GetRandomDecimal(3.5, 6.0, 2),
                            HeartBeatRatio = GetRandomDecimal(60, 120, 0),
                            Reports = GetRandomReportNotes(),
                            TestedDate = testDate,
                            CreatedAt = testDate
                        });

                    }
                }

                context.LabReports.AddRange(labReports);
                await context.SaveChangesAsync();
                Log.Information("Lab reports seeded successfully.");

            }
        }

        private static decimal GetRandomDecimal(double min, double max, int decimals)
        {
            return (decimal)Math.Round(Random.Shared.NextDouble() * (max - min) + min, decimals);
        }


        private static string GetRandomTestType()
        {
            var tests = new[]
            {
                "Complete Blood Count (CBC)",
                "Basic Metabolic Panel",
                "Lipid Panel",
                "Liver Function Tests",
                "Thyroid Function Tests",
                "Urinalysis",
                "Blood Glucose Test",
                "Hemoglobin A1C",
                "Cardiac Enzymes",
                "Inflammatory Markers"
            };
            return tests[Random.Shared.Next(tests.Length)];
        }

        private static string GetRandomReportNotes()
        {
            var notes = new[]
            {
                "All values within normal range. Continue current treatment plan.",
                "Slight elevation in cholesterol levels. Recommend dietary modifications.",
                "Blood glucose levels elevated. Follow up with endocrinologist recommended.",
                "Excellent results. Patient showing good response to treatment.",
                "Minor abnormalities detected. Repeat testing in 3 months.",
                "Critical values detected. Immediate medical attention required.",
                "Results consistent with previous tests. No changes needed.",
                "Improvement noted from previous results. Continue current medication."
            };
            return notes[Random.Shared.Next(notes.Length)];
        }
    }
}