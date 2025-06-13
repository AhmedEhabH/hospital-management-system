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

        // DbSets for your entities
        public DbSet<User> Users { get; set; }
        public DbSet<MedicalHistory> MedicalHistories { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<LabReport> LabReports { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<HospitalInfo> HospitalInfos { get; set; }
        public DbSet<DoctorProfile> DoctorProfiles { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Automatically apply all IEntityTypeConfiguration<T> from this assembly
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(HospitalDbContext).Assembly);

            Log.Information("All entity configurations applied using ApplyConfigurationsFromAssembly.");
            base.OnModelCreating(modelBuilder);
        }

    }
}
