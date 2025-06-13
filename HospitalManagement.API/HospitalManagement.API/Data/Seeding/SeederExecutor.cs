using System.Reflection;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class SeederExecutor
    {
        public static async Task ExecuteAllSeedersAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();

            // Define specific order for seeders
            var seederOrder = new[]
            {
                typeof(UserSeeder),           // Seed admin and patients first
                typeof(DoctorProfileSeeder),  // Then doctors
                typeof(HospitalInfoSeeder),   // Then hospital info
                typeof(MedicalHistorySeeder), // Then medical histories
                typeof(LabReportSeeder),      // Then lab reports
                typeof(MessageSeeder),        // Then messages
                typeof(FeedbackSeeder)        // Finally feedback
            };

            foreach (var seederType in seederOrder)
            {
                var seeder = (IDataSeeder)Activator.CreateInstance(seederType)!;
                Log.Information("Running seeder: {Seeder}", seederType.Name);
                await seeder.SeedAsync(context);
            }
        }
    }
}

//using System.Reflection;
//using Serilog;

//namespace HospitalManagement.API.Data.Seeding
//{
//    public class SeederExecutor
//    {
//        public static async Task ExecuteAllSeedersAsync(IServiceProvider serviceProvider)
//        {
//            using var scope = serviceProvider.CreateScope();
//            var context = scope.ServiceProvider.GetRequiredService<HospitalDbContext>();

//            var seederTypes = Assembly.GetExecutingAssembly()
//                .GetTypes()
//                .Where(t => typeof(IDataSeeder).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

//            foreach (var seederType in seederTypes)
//            {
//                var seeder = (IDataSeeder)Activator.CreateInstance(seederType)!;
//                Log.Information("Running seeder: {Seeder}", seederType.Name);
//                await seeder.SeedAsync(context);
//            }
//        }
//    }
//}
