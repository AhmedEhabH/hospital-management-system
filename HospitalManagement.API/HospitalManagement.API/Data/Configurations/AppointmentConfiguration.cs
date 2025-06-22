using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalManagement.API.Data.Configurations
{
    public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            // Table configuration
            builder.ToTable("Appointments");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties configuration
            builder.Property(e => e.DoctorName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(e => e.PatientName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(e => e.Date)
                   .IsRequired();

            builder.Property(e => e.Time)
                   .IsRequired()
                   .HasMaxLength(10);

            builder.Property(e => e.Department)
                   .HasMaxLength(50);

            builder.Property(e => e.Type)
                   .HasMaxLength(50);

            builder.Property(e => e.Status)
                   .HasMaxLength(20)
                   .HasDefaultValue("Scheduled");

            builder.Property(e => e.Priority)
                   .HasMaxLength(10)
                   .HasDefaultValue("Medium");

            // Foreign key relationships
            builder.HasOne(e => e.Doctor)
                   .WithMany()
                   .HasForeignKey(e => e.DoctorId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Patient)
                   .WithMany()
                   .HasForeignKey(e => e.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Indexes for performance
            builder.HasIndex(e => e.DoctorId);
            builder.HasIndex(e => e.PatientId);
            builder.HasIndex(e => e.Date);
            builder.HasIndex(e => e.Status);
            builder.HasIndex(e => new { e.DoctorId, e.Date }); // Composite index for doctor's daily schedule
        }
    }
}
