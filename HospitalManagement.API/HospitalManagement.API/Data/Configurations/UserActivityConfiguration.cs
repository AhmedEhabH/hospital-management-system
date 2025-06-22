using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HospitalManagement.API.Data.Configurations
{
    public class UserActivityConfiguration : IEntityTypeConfiguration<UserActivity>
    {
        public void Configure(EntityTypeBuilder<UserActivity> builder)
        {
            // Table configuration
            builder.ToTable("UserActivities");

            // Primary key
            builder.HasKey(e => e.Id);

            // Properties configuration
            builder.Property(e => e.UserName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(e => e.UserType)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(e => e.Action)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(e => e.IpAddress)
                   .HasMaxLength(45); // IPv6 support

            builder.Property(e => e.Status)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(e => e.Timestamp)
                   .IsRequired();

            // Foreign key relationship
            builder.HasOne(e => e.User)
                   .WithMany()
                   .HasForeignKey(e => e.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Indexes for performance
            builder.HasIndex(e => e.UserId);
            builder.HasIndex(e => e.Timestamp);
            builder.HasIndex(e => e.UserType);
            builder.HasIndex(e => e.Status);
        }
    }
}
