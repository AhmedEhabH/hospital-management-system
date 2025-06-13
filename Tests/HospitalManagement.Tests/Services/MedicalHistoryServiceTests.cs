using AutoMapper;
using FluentAssertions;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Implementations;
using Moq;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HospitalManagement.Tests.Services
{
    public class MedicalHistoryServiceTests : IDisposable
    {
        private readonly Mock<IMedicalHistoryRepository> _mockMedicalHistoryRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly MedicalHistoryService _medicalHistoryService;

        public MedicalHistoryServiceTests()
        {
            Log.Information("Setting up MedicalHistoryService unit tests");

            _mockMedicalHistoryRepository = new Mock<IMedicalHistoryRepository>();
            _mockMapper = new Mock<IMapper>();

            _medicalHistoryService = new MedicalHistoryService(
                _mockMedicalHistoryRepository.Object,
                _mockMapper.Object);
        }

        [Fact]
        public async Task GetMedicalHistoriesByUserIdAsync_ValidUserId_ReturnsHistories()
        {
            // Arrange
            Log.Information("Testing GetMedicalHistoriesByUserIdAsync with valid user ID");

            var userId = 1;
            var medicalHistories = new List<MedicalHistory>
            {
                new MedicalHistory { Id = 1, UserId = userId, PersonalHistory = "Test history" }
            };
            var medicalHistoryDtos = new List<MedicalHistoryDto>
            {
                new MedicalHistoryDto { Id = 1, UserId = userId, PersonalHistory = "Test history" }
            };

            _mockMedicalHistoryRepository.Setup(r => r.GetByUserIdAsync(userId))
                .ReturnsAsync(medicalHistories);
            _mockMapper.Setup(m => m.Map<IEnumerable<MedicalHistoryDto>>(medicalHistories))
                .Returns(medicalHistoryDtos);

            // Act
            var result = await _medicalHistoryService.GetMedicalHistoriesByUserIdAsync(userId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().UserId.Should().Be(userId);

            Log.Information("GetMedicalHistoriesByUserIdAsync test completed successfully");
        }

        [Fact]
        public async Task AddMedicalHistoryAsync_ValidDto_ReturnsCreatedHistory()
        {
            // Arrange
            Log.Information("Testing AddMedicalHistoryAsync with valid DTO");

            var dto = new MedicalHistoryDto { UserId = 1, PersonalHistory = "New history" };
            var entity = new MedicalHistory { Id = 1, UserId = 1, PersonalHistory = "New history" };

            _mockMapper.Setup(m => m.Map<MedicalHistory>(dto)).Returns(entity);
            _mockMedicalHistoryRepository.Setup(r => r.AddAsync(entity)).Returns(Task.CompletedTask);
            _mockMedicalHistoryRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);
            _mockMapper.Setup(m => m.Map<MedicalHistoryDto>(entity)).Returns(dto);

            // Act
            var result = await _medicalHistoryService.AddMedicalHistoryAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be(1);

            Log.Information("AddMedicalHistoryAsync test completed successfully");
        }

        [Fact]
        public async Task UpdateMedicalHistoryAsync_ExistingId_ReturnsTrue()
        {
            // Arrange
            Log.Information("Testing UpdateMedicalHistoryAsync with existing ID");

            var id = 1;
            var dto = new MedicalHistoryDto { Id = id, UserId = 1, PersonalHistory = "Updated history" };
            var entity = new MedicalHistory { Id = id, UserId = 1, PersonalHistory = "Original history" };

            _mockMedicalHistoryRepository.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(entity);
            _mockMapper.Setup(m => m.Map(dto, entity));
            _mockMedicalHistoryRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            var result = await _medicalHistoryService.UpdateMedicalHistoryAsync(id, dto);

            // Assert
            result.Should().BeTrue();

            Log.Information("UpdateMedicalHistoryAsync test completed successfully");
        }

        [Fact]
        public async Task DeleteMedicalHistoryAsync_NonExistingId_ReturnsFalse()
        {
            // Arrange
            Log.Information("Testing DeleteMedicalHistoryAsync with non-existing ID");

            var id = 999;
            _mockMedicalHistoryRepository.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((MedicalHistory)null!);

            // Act
            var result = await _medicalHistoryService.DeleteMedicalHistoryAsync(id);

            // Assert
            result.Should().BeFalse();

            Log.Information("DeleteMedicalHistoryAsync test completed successfully");
        }

        public void Dispose()
        {
            Log.Information("Disposing MedicalHistoryService unit tests");
        }
    }
}