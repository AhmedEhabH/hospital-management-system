using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

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

            builder.Property(dp => dp.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(dp => dp.UpdatedAt)
                .IsRequired(false);

            // Relationship: One DoctorProfile to One User (UserId is unique)
            builder.HasOne(dp => dp.User)
                .WithOne(u => u.DoctorProfile)
                .HasForeignKey<DoctorProfile>(dp => dp.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
