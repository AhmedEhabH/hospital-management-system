using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Data.Configurations
{
    public class DoctorProfileConfiguration : IEntityTypeConfiguration<DoctorProfile>
    {
        public void Configure(EntityTypeBuilder<DoctorProfile> builder)
        {
            builder.ToTable("DoctorProfiles");

            builder.HasKey(dp => dp.Id);

            builder.Property(dp => dp.UserId)
                .IsRequired();

            builder.Property(dp => dp.HospitalName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(dp => dp.Qualification)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(dp => dp.Experience)
                .IsRequired();

            builder.Property(dp => dp.SpecialistIn)
                .IsRequired()
                .HasMaxLength(100);

            // ADDED: Enhanced property configurations
            builder.Property(dp => dp.LicenseNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(dp => dp.LicenseNumber)
                .IsUnique();

            builder.Property(dp => dp.Specialization)
                .HasMaxLength(100);

            builder.Property(dp => dp.Biography)
                .HasMaxLength(500);

            builder.Property(dp => dp.Education)
                .HasMaxLength(200);

            builder.Property(dp => dp.Certifications)
                .HasMaxLength(200);

            builder.Property(dp => dp.Department)
                .HasMaxLength(100);

            builder.Property(dp => dp.OfficeLocation)
                .HasMaxLength(50);

            builder.Property(dp => dp.DirectPhone)
                .HasMaxLength(15);

            builder.Property(dp => dp.ProfessionalEmail)
                .HasMaxLength(100);

            builder.Property(dp => dp.IsAvailableForConsultation)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(dp => dp.ConsultationFee)
                .HasColumnType("decimal(10,2)");

            builder.Property(dp => dp.WorkingHours)
                .HasMaxLength(200);

            builder.Property(dp => dp.MedicalSchool)
                .HasMaxLength(100);

            builder.Property(dp => dp.Residency)
                .HasMaxLength(100);

            builder.Property(dp => dp.Fellowship)
                .HasMaxLength(100);

            builder.Property(dp => dp.ResearchInterests)
                .HasMaxLength(500);

            builder.Property(dp => dp.Publications)
                .HasMaxLength(500);

            builder.Property(dp => dp.Languages)
                .HasMaxLength(200);

            builder.Property(dp => dp.AcceptsNewPatients)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(dp => dp.AcceptsInsurance)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(dp => dp.InsuranceAccepted)
                .HasMaxLength(500);

            builder.Property(dp => dp.CreatedAt)
                .IsRequired();

            builder.Property(dp => dp.UpdatedAt);

            // Configure relationship with User
            builder.HasOne(dp => dp.User)
                .WithOne(u => u.DoctorProfile)
                .HasForeignKey<DoctorProfile>(dp => dp.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
