using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalManagement.API.Data.Configurations
{
    public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            builder.ToTable("Appointments");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.Id)
                .ValueGeneratedOnAdd();

            builder.Property(a => a.DoctorName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(a => a.PatientName)
                .IsRequired()
                .HasMaxLength(100);

            // FIXED: Replace Date with StartTime
            builder.Property(a => a.StartTime)
                .IsRequired()
                .HasColumnType("datetime2");

            // FIXED: Replace Time with EndTime
            builder.Property(a => a.EndTime)
                .IsRequired()
                .HasColumnType("datetime2");

            // FIXED: Replace Department with Title
            builder.Property(a => a.Title)
                .IsRequired()
                .HasMaxLength(200);

            // FIXED: Replace Type with Notes (or remove if not needed)
            builder.Property(a => a.Notes)
                .HasMaxLength(1000);

            // FIXED: Remove Priority configuration or add it to Notes
            builder.Property(a => a.Status)
                .IsRequired()
                .HasMaxLength(50);

            // Foreign key relationships
            builder.HasOne(a => a.Doctor)
                .WithMany()
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Patient)
                .WithMany()
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes for performance
            builder.HasIndex(a => a.DoctorId);
            builder.HasIndex(a => a.PatientId);
            // FIXED: Replace Date index with StartTime
            builder.HasIndex(a => a.StartTime);
            builder.HasIndex(a => a.Status);

            // Seed data
            builder.HasData(
                new Appointment
                {
                    Id = 1,
                    DoctorId = 1,
                    PatientId = 2,
                    DoctorName = "Dr. Smith",
                    PatientName = "John Doe",
                    // FIXED: Replace Date with StartTime
                    StartTime = new DateTime(2025, 1, 15, 9, 0, 0),
                    // FIXED: Replace Time with EndTime
                    EndTime = new DateTime(2025, 1, 15, 10, 0, 0),
                    Title = "Cardiology Consultation",
                    Status = "Scheduled",
                    Notes = "Routine checkup"
                }
            );
        }
    }
}
