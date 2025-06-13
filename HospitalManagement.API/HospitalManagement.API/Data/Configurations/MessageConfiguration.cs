using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Data.Configurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.ToTable("Messages");
            builder.HasKey(m => m.Id);

            builder.Property(m => m.SenderId)
                .IsRequired();

            builder.Property(m => m.ReceiverId)
                .IsRequired();

            builder.Property(m => m.Subject)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(m => m.MessageContent)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(m => m.IsRead)
                .IsRequired();

            builder.Property(m => m.SentDate)
                .HasDefaultValueSql("GETUTCDATE()");

            // Relationships: Restrict delete to preserve message history
            builder.HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
