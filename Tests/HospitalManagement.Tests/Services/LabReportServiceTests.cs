using Xunit;
using Moq;
using AutoMapper;
using FluentAssertions;
using HospitalManagement.API.Services.Implementations;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Repositories.Interfaces;
using Serilog;

namespace HospitalManagement.Tests.Services
{
    public class LabReportServiceTests : IDisposable
    {
        private readonly Mock<ILabReportRepository> _mockLabReportRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly LabReportService _labReportService;

        public LabReportServiceTests()
        {
            Log.Information("Setting up LabReportService unit tests");

            _mockLabReportRepository = new Mock<ILabReportRepository>();
            _mockMapper = new Mock<IMapper>();

            _labReportService = new LabReportService(
                _mockLabReportRepository.Object,
                _mockMapper.Object);
        }

        [Fact]
        public async Task GetLabReportsByPatientIdAsync_ValidPatientId_ReturnsReports()
        {
            // Arrange
            Log.Information("Testing GetLabReportsByPatientIdAsync with valid patient ID");

            var patientId = 1;
            var labReports = new List<LabReport>
            {
                new LabReport
                {
                    Id = 1,
                    PatientId = patientId,
                    TestPerformed = "Blood Test",
                    CholesterolLevel = 180.5m
                }
            };
            var labReportDtos = new List<LabReportDto>
            {
                new LabReportDto
                {
                    Id = 1,
                    PatientId = patientId,
                    TestPerformed = "Blood Test",
                    CholesterolLevel = 180.5m
                }
            };

            _mockLabReportRepository.Setup(r => r.GetByPatientIdAsync(patientId))
                .ReturnsAsync(labReports);
            _mockMapper.Setup(m => m.Map<IEnumerable<LabReportDto>>(labReports))
                .Returns(labReportDtos);

            // Act
            var result = await _labReportService.GetLabReportsByPatientIdAsync(patientId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().TestPerformed.Should().Be("Blood Test");
            result.First().CholesterolLevel.Should().Be(180.5m);

            Log.Information("GetLabReportsByPatientIdAsync test completed successfully");
        }

        [Fact]
        public async Task AddLabReportAsync_ValidDto_ReturnsCreatedReport()
        {
            // Arrange
            Log.Information("Testing AddLabReportAsync with valid DTO");

            var dto = new LabReportDto
            {
                PatientId = 1,
                TestPerformed = "X-Ray",
                TestedBy = "Dr. Smith"
            };
            var entity = new LabReport
            {
                Id = 1,
                PatientId = 1,
                TestPerformed = "X-Ray",
                TestedBy = "Dr. Smith"
            };

            _mockMapper.Setup(m => m.Map<LabReport>(dto)).Returns(entity);
            _mockLabReportRepository.Setup(r => r.AddAsync(entity)).Returns(Task.CompletedTask);
            _mockLabReportRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);
            _mockMapper.Setup(m => m.Map<LabReportDto>(entity)).Returns(dto);

            // Act
            var result = await _labReportService.AddLabReportAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.TestPerformed.Should().Be("X-Ray");
            result.TestedBy.Should().Be("Dr. Smith");

            Log.Information("AddLabReportAsync test completed successfully");
        }

        public void Dispose()
        {
            Log.Information("Disposing LabReportService unit tests");
        }
    }
}
