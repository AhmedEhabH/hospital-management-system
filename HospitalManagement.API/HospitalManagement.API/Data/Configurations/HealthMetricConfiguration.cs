using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalManagement.API.Data.Configurations
{
    public class HealthMetricConfiguration : IEntityTypeConfiguration<HealthMetric>
    {
        public void Configure(EntityTypeBuilder<HealthMetric> builder)
        {
            // Table configuration
            builder.ToTable("HealthMetrics");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties configuration
            builder.Property(e => e.BloodPressureSystolic)
                   .IsRequired();

            builder.Property(e => e.BloodPressureDiastolic)
                   .IsRequired();

            builder.Property(e => e.HeartRate)
                   .IsRequired();

            builder.Property(e => e.Weight)
                   .HasPrecision(5, 2); // 999.99 kg max

            builder.Property(e => e.Temperature)
                   .HasPrecision(4, 1); // 999.9°C max

            builder.Property(e => e.RecordedDate)
                   .IsRequired();

            // Foreign key relationship
            builder.HasOne(e => e.Patient)
                   .WithMany()
                   .HasForeignKey(e => e.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Indexes for performance
            builder.HasIndex(e => e.PatientId);
            builder.HasIndex(e => e.RecordedDate);
            builder.HasIndex(e => new { e.PatientId, e.RecordedDate }); // Composite index for patient's health timeline
        }
    }
}
