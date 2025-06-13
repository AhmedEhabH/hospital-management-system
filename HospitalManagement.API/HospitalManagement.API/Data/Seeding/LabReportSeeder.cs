using HospitalManagement.API.Models.Entities;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class LabReportSeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            if (!context.LabReports.Any())
            {
                Log.Information("Seeding lab reports...");

                var patientUsers = context.Users.Where(u => u.UserType == "Patient").ToList();

                if (patientUsers.Any())
                {
                    var labReports = new List<LabReport>
                    {
                        new LabReport
                        {
                            PatientId = patientUsers.First().Id,
                            TestedBy = "Dr. Ahmed Hassan",
                            TestPerformed = "Complete Blood Count (CBC)",
                            PhLevel = 7.4m,
                            CholesterolLevel = 180.5m,
                            SucroseLevel = 95.2m,
                            WhiteBloodCellsRatio = 7.2m,
                            RedBloodCellsRatio = 4.5m,
                            HeartBeatRatio = 72.0m,
                            Reports = "All values within normal range. Patient is healthy.",
                            TestedDate = DateTime.UtcNow.AddDays(-7),
                            CreatedAt = DateTime.UtcNow
                        },
                        new LabReport
                        {
                            PatientId = patientUsers.First().Id,
                            TestedBy = "Dr. Fatima Ali",
                            TestPerformed = "Lipid Panel",
                            PhLevel = 7.35m,
                            CholesterolLevel = 195.0m,
                            SucroseLevel = 88.7m,
                            WhiteBloodCellsRatio = 6.8m,
                            RedBloodCellsRatio = 4.3m,
                            HeartBeatRatio = 68.0m,
                            Reports = "Cholesterol slightly elevated. Recommend dietary changes.",
                            TestedDate = DateTime.UtcNow.AddDays(-14),
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    context.LabReports.AddRange(labReports);
                    await context.SaveChangesAsync();
                    Log.Information("Lab reports seeded successfully.");
                }
            }
        }
    }
}