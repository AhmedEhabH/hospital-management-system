using HospitalManagement.API.Data.Configurations;
using HospitalManagement.API.Data.Seeding;
using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace HospitalManagement.API.Data
{
    public class HospitalDbContext : DbContext
    {
        public HospitalDbContext(DbContextOptions<HospitalDbContext> options) : base(options)
        {
            Log.Information("HospitalDbContext initialized.");
        }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<MedicalHistory> MedicalHistories { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<LabReport> LabReports { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<HospitalInfo> HospitalInfos { get; set; }

        // FIXED: Add DoctorProfile DbSet
        public DbSet<DoctorProfile> DoctorProfiles
        {
            get; set;
        }

        // New DbSets
        public DbSet<UserActivity> UserActivities { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<HealthMetric> HealthMetrics { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Apply configurations
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new MedicalHistoryConfiguration());
            modelBuilder.ApplyConfiguration(new FeedbackConfiguration());
            modelBuilder.ApplyConfiguration(new LabReportConfiguration());
            modelBuilder.ApplyConfiguration(new MessageConfiguration());

            // FIXED: Apply DoctorProfile configuration
            modelBuilder.ApplyConfiguration(new DoctorProfileConfiguration());

            modelBuilder.ApplyConfiguration(new UserActivityConfiguration());
            modelBuilder.ApplyConfiguration(new AppointmentConfiguration());
            modelBuilder.ApplyConfiguration(new HealthMetricConfiguration());

            Log.Information("All entity configurations applied using ApplyConfigurationsFromAssembly.");
            base.OnModelCreating(modelBuilder);
        }

    }
}
