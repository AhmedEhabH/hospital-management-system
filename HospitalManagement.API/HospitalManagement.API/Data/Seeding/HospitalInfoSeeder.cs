using HospitalManagement.API.Models.Entities;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class HospitalInfoSeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            if (!context.HospitalInfos.Any())
            {
                Log.Information("Seeding hospital information...");
                var hospitalInfos = new List<HospitalInfo>
                {
                    new HospitalInfo
                    {
                        HospitalName = "City General Hospital",
                        Address = "123 Medical Center Drive",
                        City = "Cairo",
                        PhoneNumber = "+20-2-12345678",
                        Email = "info@citygeneral.com",
                        Description = "Leading healthcare provider with 24/7 emergency services",
                        CreatedAt = DateTime.UtcNow
                    },
                    new HospitalInfo
                    {
                        HospitalName = "Al Khosous Medical Center",
                        Address = "456 Health Street",
                        City = "Al Khosous",
                        PhoneNumber = "+20-2-87654321",
                        Email = "contact@alkhosousmedical.com",
                        Description = "Specialized medical center serving the local community",
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.HospitalInfos.AddRange(hospitalInfos);
                await context.SaveChangesAsync();
                Log.Information("Hospital information seeded successfully.");
            }
        }
    }
}