using HospitalManagement.API.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Data.Configurations
{
    public class LabReportConfiguration : IEntityTypeConfiguration<LabReport>
    {
        public void Configure(EntityTypeBuilder<LabReport> builder)
        {
            builder.ToTable("LabReports");
            builder.HasKey(lr => lr.Id);

            builder.Property(lr => lr.PatientId)
                .IsRequired();

            builder.Property(lr => lr.TestedBy)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(lr => lr.TestPerformed)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(lr => lr.Reports)
                .HasMaxLength(1000);

            builder.Property(lr => lr.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(lr => lr.TestedDate)
                .IsRequired();

            // Add explicit precision and scale for decimal properties:
            builder.Property(lr => lr.CholesterolLevel).HasPrecision(18, 2);
            builder.Property(lr => lr.HeartBeatRatio).HasPrecision(18, 2);
            builder.Property(lr => lr.PhLevel).HasPrecision(18, 2);
            builder.Property(lr => lr.RedBloodCellsRatio).HasPrecision(18, 2);
            builder.Property(lr => lr.SucroseLevel).HasPrecision(18, 2);
            builder.Property(lr => lr.WhiteBloodCellsRatio).HasPrecision(18, 2);

            // Relationship: Many LabReports to One Patient (User)
            builder.HasOne(lr => lr.Patient)
                .WithMany(u => u.LabReports)
                .HasForeignKey(lr => lr.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
