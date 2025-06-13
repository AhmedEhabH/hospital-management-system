using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Data.Configurations
{
    public class MedicalHistoryConfiguration : IEntityTypeConfiguration<MedicalHistory>
    {
        public void Configure(EntityTypeBuilder<MedicalHistory> builder)
        {
            builder.ToTable("MedicalHistories");
            builder.HasKey(mh => mh.Id);

            builder.Property(mh => mh.UserId)
                .IsRequired();

            builder.Property(mh => mh.PersonalHistory)
                .HasMaxLength(500);

            builder.Property(mh => mh.FamilyHistory)
                .HasMaxLength(500);

            builder.Property(mh => mh.Allergies)
                .HasMaxLength(500);

            builder.Property(mh => mh.FrequentlyOccurringDisease)
                .HasMaxLength(500);

            builder.Property(mh => mh.CurrentMedications)
                .HasMaxLength(500);

            builder.Property(mh => mh.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(mh => mh.UpdatedAt)
                .IsRequired(false);

            // Relationship: Many MedicalHistories to One User
            builder.HasOne(mh => mh.User)
                .WithMany(u => u.MedicalHistories)
                .HasForeignKey(mh => mh.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
    
}
