using HospitalManagement.API.Models.Entities;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class FeedbackSeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            if (!context.Feedbacks.Any())
            {
                Log.Information("Seeding feedback...");

                var users = context.Users.Where(u => u.UserType == "Patient").ToList();

                if (users.Any())
                {
                    var feedbacks = new List<Feedback>
                    {
                        new Feedback
                        {
                            UserId = users.First().Id,
                            UserName = $"{users.First().FirstName} {users.First().LastName}",
                            EmailId = users.First().Email,
                            Comments = "Excellent service and professional staff. The doctors were very knowledgeable and caring.",
                            CreatedAt = DateTime.UtcNow.AddDays(-5)
                        }
                    };

                    context.Feedbacks.AddRange(feedbacks);
                    await context.SaveChangesAsync();
                    Log.Information("Feedback seeded successfully.");
                }
            }
        }
    }
}