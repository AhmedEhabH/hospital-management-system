using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Data.Configurations
{
    public class HospitalInfoConfiguration : IEntityTypeConfiguration<HospitalInfo>
    {
        public void Configure(EntityTypeBuilder<HospitalInfo> builder)
        {
            builder.ToTable("HospitalInfos");
            builder.HasKey(hi => hi.Id);

            builder.Property(hi => hi.HospitalName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(hi => hi.Address)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(hi => hi.City)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(hi => hi.PhoneNumber)
                .HasMaxLength(15);

            builder.Property(hi => hi.Email)
                .HasMaxLength(100);

            builder.Property(hi => hi.Description)
                .HasMaxLength(1000);

            builder.Property(hi => hi.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(hi => hi.UpdatedAt)
                .IsRequired(false);
        }
    }
}
