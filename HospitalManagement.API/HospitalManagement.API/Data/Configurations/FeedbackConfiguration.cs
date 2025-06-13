using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Data.Configurations
{
    public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
    {
        public void Configure(EntityTypeBuilder<Feedback> builder)
        {
            builder.ToTable("Feedbacks");
            builder.HasKey(fb => fb.Id);

            builder.Property(fb => fb.UserId)
                .IsRequired();

            builder.Property(fb => fb.UserName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(fb => fb.EmailId)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(fb => fb.Comments)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(fb => fb.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Relationship: Many Feedbacks to One User
            builder.HasOne(fb => fb.User)
                .WithMany(u => u.Feedbacks)
                .HasForeignKey(fb => fb.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
