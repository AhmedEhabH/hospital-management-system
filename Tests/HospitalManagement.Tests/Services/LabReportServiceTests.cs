using Xunit;
using Moq;
using AutoMapper;
using Microsoft.Extensions.Logging;
using HospitalManagement.API.Services.Implementations;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.Tests.Services
{
    public class LabReportServiceTests : IDisposable
    {
        private readonly Mock<ILabReportRepository> _mockRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<LabReportService>> _mockLogger;
        private readonly LabReportService _labReportService;

        public LabReportServiceTests()
        {
            _mockRepository = new Mock<ILabReportRepository>();
            _mockMapper = new Mock<IMapper>();
            // FIXED: Add missing logger mock
            _mockLogger = new Mock<ILogger<LabReportService>>();

            // FIXED: Include logger in constructor
            _labReportService = new LabReportService(
                _mockRepository.Object,
                _mockMapper.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task GetLabReportByIdAsync_ValidId_ReturnsLabReportDto()
        {
            // Arrange
            var labReportId = 1;
            var labReport = new LabReport
            {
                Id = labReportId,
                PatientId = 1,
                TestedBy = "Dr. Test",
                TestPerformed = "Blood Test",
                PhLevel = 7.4m,
                CholesterolLevel = 200m,
                SucroseLevel = 100m,
                WhiteBloodCellsRatio = 5000m,
                RedBloodCellsRatio = 4500000m,
                HeartBeatRatio = 72m,
                Reports = "Normal values",
                TestedDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            var labReportDto = new LabReportDto
            {
                Id = labReportId,
                PatientId = 1,
                TestedBy = "Dr. Test",
                TestPerformed = "Blood Test",
                PhLevel = 7.4M,
                CholesterolLevel = 200,
                SucroseLevel = 100,
                WhiteBloodCellsRatio = 5000,
                RedBloodCellsRatio = 4500000,
                HeartBeatRatio = 72,
                Reports = "Normal values",
                TestedDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(r => r.GetByIdAsync(labReportId))
                          .ReturnsAsync(labReport);
            _mockMapper.Setup(m => m.Map<LabReportDto>(labReport))
                      .Returns(labReportDto);

            // Act
            var result = await _labReportService.GetLabReportByIdAsync(labReportId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(labReportId, result.Id);
            Assert.Equal("Dr. Test", result.TestedBy);
        }

        [Fact]
        public async Task CreateLabReportAsync_ValidLabReport_ReturnsLabReportDto()
        {
            // Arrange
            var labReportDto = new LabReportDto
            {
                PatientId = 1,
                TestedBy = "Dr. Test",
                TestPerformed = "Blood Test",
                PhLevel = 7.4M,
                CholesterolLevel = 200,
                SucroseLevel = 100,
                WhiteBloodCellsRatio = 5000,
                RedBloodCellsRatio = 4500000,
                HeartBeatRatio = 72,
                Reports = "Normal values",
                TestedDate = DateTime.UtcNow
            };
            var labReport = new LabReport
            {
                Id = 1,
                PatientId = 1,
                TestedBy = "Dr. Test",
                TestPerformed = "Blood Test",
                PhLevel = 7.4m,
                CholesterolLevel = 200m,
                SucroseLevel = 100m,
                WhiteBloodCellsRatio = 5000m,
                RedBloodCellsRatio = 4500000m,
                HeartBeatRatio = 72m,
                Reports = "Normal values",
                TestedDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            var createdLabReport = new LabReport
            {
                Id = 1,
                PatientId = 1,
                TestedBy = "Dr. Test",
                TestPerformed = "Blood Test",
                PhLevel = 7.4m,
                CholesterolLevel = 200m,
                SucroseLevel = 100m,
                WhiteBloodCellsRatio = 5000m,
                RedBloodCellsRatio = 4500000m,
                HeartBeatRatio = 72m,
                Reports = "Normal values",
                TestedDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _mockMapper.Setup(m => m.Map<LabReport>(labReportDto))
                      .Returns(labReport);
            // FIXED: Use correct return type for AddAsync
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<LabReport>()))
                          .ReturnsAsync(createdLabReport);
            _mockMapper.Setup(m => m.Map<LabReportDto>(createdLabReport))
                      .Returns(labReportDto);

            // Act
            // FIXED: Use correct method name
            var result = await _labReportService.CreateLabReportAsync(labReportDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Dr. Test", result.TestedBy);
            Assert.Equal("Blood Test", result.TestPerformed);
        }

        [Fact]
        public async Task UpdateLabReportAsync_ValidLabReport_UpdatesSuccessfully()
        {
            // Arrange
            var labReportDto = new LabReportDto
            {
                Id = 1,
                PatientId = 1,
                TestedBy = "Dr. Updated",
                TestPerformed = "Updated Blood Test",
                PhLevel = 7.3M,
                CholesterolLevel = 210,
                SucroseLevel = 110,
                WhiteBloodCellsRatio = 5100,
                RedBloodCellsRatio = 4600000,
                HeartBeatRatio = 75,
                Reports = "Updated values",
                TestedDate = DateTime.UtcNow
            };
            var labReport = new LabReport
            {
                Id = 1,
                PatientId = 1,
                TestedBy = "Dr. Updated",
                TestPerformed = "Updated Blood Test",
                PhLevel = 7.3m,
                CholesterolLevel = 210m,
                SucroseLevel = 110m,
                WhiteBloodCellsRatio = 5100m,
                RedBloodCellsRatio = 4600000m,
                HeartBeatRatio = 75m,
                Reports = "Updated values",
                TestedDate = DateTime.UtcNow
            };

            _mockMapper.Setup(m => m.Map<LabReport>(labReportDto))
                      .Returns(labReport);
            _mockRepository.Setup(r => r.Update(It.IsAny<LabReport>()))
                          .Returns(Task.CompletedTask);

            // Act
            await _labReportService.UpdateLabReportAsync(labReportDto);

            // Assert
            _mockRepository.Verify(r => r.Update(It.IsAny<LabReport>()), Times.Once);
        }

        [Fact]
        public async Task DeleteLabReportAsync_ValidId_DeletesSuccessfully()
        {
            // Arrange
            var labReportId = 1;

            _mockRepository.Setup(r => r.DeleteAsync(labReportId))
                          .Returns(Task.CompletedTask);

            // Act
            await _labReportService.DeleteLabReportAsync(labReportId);

            // Assert
            _mockRepository.Verify(r => r.DeleteAsync(labReportId), Times.Once);
        }

        [Fact]
        public async Task GetLabReportsByPatientIdAsync_ValidPatientId_ReturnsLabReportList()
        {
            // Arrange
            var patientId = 1;
            var labReports = new List<LabReport>
            {
                new LabReport
                {
                    Id = 1,
                    PatientId = patientId,
                    TestedBy = "Dr. Test 1",
                    TestPerformed = "Blood Test",
                    TestedDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                },
                new LabReport
                {
                    Id = 2,
                    PatientId = patientId,
                    TestedBy = "Dr. Test 2",
                    TestPerformed = "Urine Test",
                    TestedDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                }
            };
            var labReportDtos = new List<LabReportDto>
            {
                new LabReportDto
                {
                    Id = 1,
                    PatientId = patientId,
                    TestedBy = "Dr. Test 1",
                    TestPerformed = "Blood Test",
                    TestedDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                },
                new LabReportDto
                {
                    Id = 2,
                    PatientId = patientId,
                    TestedBy = "Dr. Test 2",
                    TestPerformed = "Urine Test",
                    TestedDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _mockRepository.Setup(r => r.GetByPatientIdAsync(patientId))
                          .ReturnsAsync(labReports);
            _mockMapper.Setup(m => m.Map<IEnumerable<LabReportDto>>(labReports))
                      .Returns(labReportDtos);

            // Act
            var result = await _labReportService.GetLabReportsByPatientIdAsync(patientId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        public void Dispose()
        {
            // Clean up resources if needed
            _labReportService?.Dispose();
        }
    }
}
