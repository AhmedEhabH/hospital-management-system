using HospitalManagement.API.Data;
using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Data.Seeding
{
    public static class DashboardDataSeeder
    {
        public static async Task SeedDashboardDataAsync(HospitalDbContext context)
        {
            // Seed User Activities
            await SeedUserActivitiesAsync(context);

            // Seed Appointments
            await SeedAppointmentsAsync(context);

            // Seed Health Metrics
            await SeedHealthMetricsAsync(context);

            await context.SaveChangesAsync();
        }

        private static async Task SeedUserActivitiesAsync(HospitalDbContext context)
        {
            if (!await context.UserActivities.AnyAsync())
            {
                var users = await context.Users.ToListAsync();
                var activities = new List<UserActivity>();

                // Create realistic medical activities for each user type
                foreach (var user in users)
                {
                    var userActivities = GenerateUserActivities(user);
                    activities.AddRange(userActivities);
                }

                context.UserActivities.AddRange(activities);
            }
        }

        private static List<UserActivity> GenerateUserActivities(User user)
        {
            var activities = new List<UserActivity>();
            var random = new Random();

            // Generate 5-15 activities per user over the last 30 days
            var activityCount = random.Next(5, 16);

            for (int i = 0; i < activityCount; i++)
            {
                var activity = new UserActivity
                {
                    UserId = user.Id,
                    UserName = $"{user.FirstName} {user.LastName}",
                    UserType = user.UserType,
                    Action = GetRandomActionByUserType(user.UserType),
                    Timestamp = DateTime.UtcNow.AddDays(-random.Next(0, 30)).AddHours(-random.Next(0, 24)),
                    IpAddress = GenerateRandomIpAddress(),
                    Status = GetRandomStatus()
                };

                activities.Add(activity);
            }

            return activities;
        }

        private static async Task SeedAppointmentsAsync(HospitalDbContext context)
        {
            if (!await context.Appointments.AnyAsync())
            {
                var doctors = await context.Users.Where(u => u.UserType == "Doctor").ToListAsync();
                var patients = await context.Users.Where(u => u.UserType == "Patient").ToListAsync();
                var appointments = new List<Appointment>();

                // Generate appointments for the next 30 days and past 7 days
                for (int dayOffset = -7; dayOffset <= 30; dayOffset++)
                {
                    var appointmentDate = DateTime.Today.AddDays(dayOffset);

                    // Skip weekends for regular appointments
                    if (appointmentDate.DayOfWeek == DayOfWeek.Saturday || appointmentDate.DayOfWeek == DayOfWeek.Sunday)
                        continue;

                    // Generate 3-8 appointments per day
                    var dailyAppointments = Random.Shared.Next(3, 9);

                    for (int i = 0; i < dailyAppointments; i++)
                    {
                        var doctor = doctors[Random.Shared.Next(doctors.Count)];
                        var patient = patients[Random.Shared.Next(patients.Count)];

                        var appointment = new Appointment
                        {
                            DoctorId = doctor.Id,
                            PatientId = patient.Id,
                            DoctorName = $"Dr. {doctor.FirstName} {doctor.LastName}",
                            PatientName = $"{patient.FirstName} {patient.LastName}",
                            Date = appointmentDate,
                            Time = GenerateAppointmentTime(i),
                            Department = GetRandomDepartment(),
                            Type = GetRandomAppointmentType(),
                            Status = GetAppointmentStatus(appointmentDate),
                            Priority = GetRandomPriority()
                        };

                        appointments.Add(appointment);
                    }
                }

                context.Appointments.AddRange(appointments);
            }
        }

        private static async Task SeedHealthMetricsAsync(HospitalDbContext context)
        {
            if (!await context.HealthMetrics.AnyAsync())
            {
                var patients = await context.Users.Where(u => u.UserType == "Patient").ToListAsync();
                var healthMetrics = new List<HealthMetric>();

                foreach (var patient in patients)
                {
                    // Generate health metrics for the last 90 days (every 3-7 days)
                    var lastRecordDate = DateTime.UtcNow.AddDays(-90);

                    while (lastRecordDate <= DateTime.UtcNow)
                    {
                        var metric = GenerateHealthMetric(patient.Id, lastRecordDate);
                        healthMetrics.Add(metric);

                        // Next record in 3-7 days
                        lastRecordDate = lastRecordDate.AddDays(Random.Shared.Next(3, 8));
                    }
                }

                context.HealthMetrics.AddRange(healthMetrics);
            }
        }

        private static HealthMetric GenerateHealthMetric(int patientId, DateTime recordDate)
        {
            var random = new Random();

            // Generate realistic health metrics with some variation
            var baseBloodPressureSystolic = 120 + random.Next(-20, 21);
            var baseBloodPressureDiastolic = 80 + random.Next(-15, 16);
            var baseHeartRate = 72 + random.Next(-12, 13);
            var baseWeight = 70 + random.Next(-20, 21);
            var baseTemperature = 36.5m + (decimal)(random.NextDouble() * 2 - 1);

            return new HealthMetric
            {
                PatientId = patientId,
                BloodPressureSystolic = Math.Max(90, Math.Min(180, baseBloodPressureSystolic)),
                BloodPressureDiastolic = Math.Max(60, Math.Min(120, baseBloodPressureDiastolic)),
                HeartRate = Math.Max(50, Math.Min(120, baseHeartRate)),
                Weight = Math.Max(40, Math.Min(150, baseWeight)),
                Temperature = Math.Max(35.0m, Math.Min(42.0m, baseTemperature)),
                RecordedDate = recordDate
            };
        }

        private static string GetRandomActionByUserType(string userType)
        {
            var actions = userType switch
            {
                "Doctor" => new[]
                {
                    "Viewed patient record", "Updated treatment plan", "Reviewed lab results",
                    "Completed consultation", "Prescribed medication", "Updated patient notes",
                    "Ordered lab tests", "Scheduled follow-up", "Reviewed medical history",
                    "Approved treatment", "Sent message to patient", "Updated diagnosis"
                },
                "Patient" => new[]
                {
                    "Updated medical history", "Viewed lab results", "Scheduled appointment",
                    "Submitted feedback", "Updated profile", "Viewed prescription",
                    "Downloaded lab report", "Sent message to doctor", "Updated emergency contact",
                    "Viewed appointment history", "Updated insurance information"
                },
                "Admin" => new[]
                {
                    "System configuration change", "User management", "Generated report",
                    "Database backup", "Security audit", "Updated system settings",
                    "Managed user roles", "Exported data", "System maintenance",
                    "Updated hospital information", "Managed departments"
                },
                _ => new[] { "System activity", "Data access", "Profile update" }
            };
            return actions[Random.Shared.Next(actions.Length)];
        }

        private static string GetRandomStatus()
        {
            var statuses = new[] { "Success", "Warning", "Failed" };
            var weights = new[] { 85, 10, 5 }; // 85% success, 10% warning, 5% failed

            var random = Random.Shared.Next(100);
            if (random < weights[0]) return statuses[0];
            if (random < weights[0] + weights[1]) return statuses[1];
            return statuses[2];
        }

        private static string GenerateRandomIpAddress()
        {
            var random = new Random();
            return $"192.168.{random.Next(1, 255)}.{random.Next(1, 255)}";
        }

        private static string GetRandomDepartment()
        {
            var departments = new[]
            {
                "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Emergency",
                "General Medicine", "Oncology", "Dermatology", "Psychiatry", "Radiology",
                "Surgery", "Internal Medicine", "Family Medicine", "Obstetrics", "Urology"
            };
            return departments[Random.Shared.Next(departments.Length)];
        }

        private static string GetRandomAppointmentType()
        {
            var types = new[]
            {
                "Consultation", "Follow-up", "Check-up", "Emergency", "Surgery",
                "Screening", "Vaccination", "Physical Therapy", "Lab Work", "Imaging"
            };
            return types[Random.Shared.Next(types.Length)];
        }

        private static string GetAppointmentStatus(DateTime appointmentDate)
        {
            var today = DateTime.Today;

            if (appointmentDate < today)
            {
                // Past appointments - mostly completed with some cancelled
                var pastStatuses = new[] { "Completed", "Completed", "Completed", "Cancelled" };
                return pastStatuses[Random.Shared.Next(pastStatuses.Length)];
            }
            else if (appointmentDate == today)
            {
                // Today's appointments - mix of scheduled, in progress, completed
                var todayStatuses = new[] { "Scheduled", "In Progress", "Completed" };
                return todayStatuses[Random.Shared.Next(todayStatuses.Length)];
            }
            else
            {
                // Future appointments - mostly scheduled with some cancelled
                var futureStatuses = new[] { "Scheduled", "Scheduled", "Scheduled", "Cancelled" };
                return futureStatuses[Random.Shared.Next(futureStatuses.Length)];
            }
        }

        private static string GetRandomPriority()
        {
            var priorities = new[] { "High", "Medium", "Low" };
            var weights = new[] { 20, 60, 20 }; // 20% high, 60% medium, 20% low

            var random = Random.Shared.Next(100);
            if (random < weights[0]) return priorities[0];
            if (random < weights[0] + weights[1]) return priorities[1];
            return priorities[2];
        }

        private static string GenerateAppointmentTime(int slotIndex)
        {
            // Generate appointment times from 8 AM to 5 PM
            //var startHour = 8;
            var timeSlots = new[]
            {
                "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
                "16:00", "16:30", "17:00"
            };

            return timeSlots[slotIndex % timeSlots.Length];
        }
    }
}

