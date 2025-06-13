using HospitalManagement.API.Models.Entities;
using Serilog;

namespace HospitalManagement.API.Data.Seeding
{
    public class MessageSeeder : IDataSeeder
    {
        public async Task SeedAsync(HospitalDbContext context)
        {
            if (!context.Messages.Any())
            {
                Log.Information("Seeding messages...");

                var doctors = context.Users.Where(u => u.UserType == "Doctor").ToList();
                var patients = context.Users.Where(u => u.UserType == "Patient").ToList();

                if (doctors.Any() && patients.Any())
                {
                    var messages = new List<Message>
                    {
                        new Message
                        {
                            SenderId = doctors.First().Id,
                            ReceiverId = patients.First().Id,
                            Subject = "Lab Results Available",
                            MessageContent = "Your recent lab results are now available. Please schedule a follow-up appointment to discuss the findings.",
                            IsRead = false,
                            SentDate = DateTime.UtcNow.AddDays(-2)
                        },
                        new Message
                        {
                            SenderId = patients.First().Id,
                            ReceiverId = doctors.First().Id,
                            Subject = "Appointment Request",
                            MessageContent = "I would like to schedule an appointment for next week. Please let me know your availability.",
                            IsRead = true,
                            SentDate = DateTime.UtcNow.AddDays(-1)
                        }
                    };

                    context.Messages.AddRange(messages);
                    await context.SaveChangesAsync();
                    Log.Information("Messages seeded successfully.");
                }
            }
        }
    }
}