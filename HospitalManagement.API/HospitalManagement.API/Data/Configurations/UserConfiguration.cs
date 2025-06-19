using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(u => u.Id);

            builder.Property(u => u.FirstName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.LastName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.Gender)
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(u => u.UserId)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(u => u.UserId)
                .IsUnique();

            // FIXED: Use PasswordHash property as requested
            builder.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(u => u.Email)
                .IsUnique();

            builder.Property(u => u.Address)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(u => u.City)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.State)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.Zip)
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(u => u.PhoneNo)
                .IsRequired()
                .HasMaxLength(15);

            builder.Property(u => u.UserType)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(u => u.CreatedAt)
                .IsRequired();

            builder.Property(u => u.UpdatedAt);

            // Configure DoctorProfile relationship
            builder.HasOne(u => u.DoctorProfile)
                .WithOne(dp => dp.User)
                .HasForeignKey<DoctorProfile>(dp => dp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationships with other entities
            builder.HasMany(u => u.MedicalHistories)
                .WithOne(mh => mh.User)
                .HasForeignKey(mh => mh.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.Feedbacks)
                .WithOne(f => f.User)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.LabReports)
                .WithOne(lr => lr.Patient)
                .HasForeignKey(lr => lr.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(u => u.SentMessages)
                .WithOne(m => m.Sender)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(u => u.ReceivedMessages)
                .WithOne(m => m.Receiver)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
