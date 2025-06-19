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
    public class MedicalHistoryServiceTests : IDisposable
    {
        private readonly Mock<IMedicalHistoryRepository> _mockRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<MedicalHistoryService>> _mockLogger;
        private readonly MedicalHistoryService _medicalHistoryService;

        public MedicalHistoryServiceTests()
        {
            _mockRepository = new Mock<IMedicalHistoryRepository>();
            _mockMapper = new Mock<IMapper>();
            // FIXED: Add missing logger mock
            _mockLogger = new Mock<ILogger<MedicalHistoryService>>();

            // FIXED: Include logger in constructor
            _medicalHistoryService = new MedicalHistoryService(
                _mockRepository.Object,
                _mockMapper.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task GetMedicalHistoryByIdAsync_ValidId_ReturnsMedicalHistoryDto()
        {
            // Arrange
            var medicalHistoryId = 1;
            var medicalHistory = new MedicalHistory
            {
                Id = medicalHistoryId,
                UserId = 1,
                PersonalHistory = "No significant personal history",
                FamilyHistory = "Family history of diabetes",
                Allergies = "Penicillin allergy",
                FrequentlyOccurringDisease = "Hypertension",
                HasAsthma = false,
                HasBloodPressure = true,
                HasCholesterol = false,
                HasDiabetes = false,
                HasHeartDisease = false,
                UsesTobacco = false,
                CigarettePacksPerDay = 0,
                SmokingYears = 0,
                DrinksAlcohol = false,
                AlcoholicDrinksPerWeek = 0,
                CurrentMedications = "Lisinopril 10mg daily"
            };
            var medicalHistoryDto = new MedicalHistoryDto
            {
                Id = medicalHistoryId,
                UserId = 1,
                PersonalHistory = "No significant personal history",
                FamilyHistory = "Family history of diabetes",
                Allergies = "Penicillin allergy",
                FrequentlyOccurringDisease = "Hypertension",
                HasAsthma = false,
                HasBloodPressure = true,
                HasCholesterol = false,
                HasDiabetes = false,
                HasHeartDisease = false,
                UsesTobacco = false,
                CigarettePacksPerDay = 0,
                SmokingYears = 0,
                DrinksAlcohol = false,
                AlcoholicDrinksPerWeek = 0,
                CurrentMedications = "Lisinopril 10mg daily"
            };

            _mockRepository.Setup(r => r.GetByIdAsync(medicalHistoryId))
                          .ReturnsAsync(medicalHistory);
            _mockMapper.Setup(m => m.Map<MedicalHistoryDto>(medicalHistory))
                      .Returns(medicalHistoryDto);

            // Act
            var result = await _medicalHistoryService.GetMedicalHistoryByIdAsync(medicalHistoryId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(medicalHistoryId, result.Id);
            Assert.Equal("Penicillin allergy", result.Allergies);
        }

        [Fact]
        public async Task GetMedicalHistoryByUserIdAsync_ValidUserId_ReturnsMedicalHistoryList()
        {
            // Arrange
            var userId = 1;
            var medicalHistories = new List<MedicalHistory>
            {
                new MedicalHistory
                {
                    Id = 1,
                    UserId = userId,
                    PersonalHistory = "History 1",
                    Allergies = "Allergy 1"
                },
                new MedicalHistory
                {
                    Id = 2,
                    UserId = userId,
                    PersonalHistory = "History 2",
                    Allergies = "Allergy 2"
                }
            };
            var medicalHistoryDtos = new List<MedicalHistoryDto>
            {
                new MedicalHistoryDto
                {
                    Id = 1,
                    UserId = userId,
                    PersonalHistory = "History 1",
                    Allergies = "Allergy 1"
                },
                new MedicalHistoryDto
                {
                    Id = 2,
                    UserId = userId,
                    PersonalHistory = "History 2",
                    Allergies = "Allergy 2"
                }
            };

            _mockRepository.Setup(r => r.GetByUserIdAsync(userId))
                          .ReturnsAsync(medicalHistories);
            _mockMapper.Setup(m => m.Map<IEnumerable<MedicalHistoryDto>>(medicalHistories))
                      .Returns(medicalHistoryDtos);

            // Act
            // FIXED: Use correct method name
            var result = await _medicalHistoryService.GetMedicalHistoryByUserIdAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task CreateMedicalHistoryAsync_ValidMedicalHistory_ReturnsMedicalHistoryDto()
        {
            // Arrange
            var medicalHistoryDto = new MedicalHistoryDto
            {
                UserId = 1,
                PersonalHistory = "New personal history",
                FamilyHistory = "New family history",
                Allergies = "New allergies",
                HasAsthma = true,
                HasBloodPressure = false,
                CurrentMedications = "New medications"
            };
            var medicalHistory = new MedicalHistory
            {
                Id = 1,
                UserId = 1,
                PersonalHistory = "New personal history",
                FamilyHistory = "New family history",
                Allergies = "New allergies",
                HasAsthma = true,
                HasBloodPressure = false,
                CurrentMedications = "New medications"
            };
            var createdMedicalHistory = new MedicalHistory
            {
                Id = 1,
                UserId = 1,
                PersonalHistory = "New personal history",
                FamilyHistory = "New family history",
                Allergies = "New allergies",
                HasAsthma = true,
                HasBloodPressure = false,
                CurrentMedications = "New medications"
            };

            _mockMapper.Setup(m => m.Map<MedicalHistory>(medicalHistoryDto))
                      .Returns(medicalHistory);
            // FIXED: Use correct return type for AddAsync
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<MedicalHistory>()))
                          .ReturnsAsync(createdMedicalHistory);
            _mockMapper.Setup(m => m.Map<MedicalHistoryDto>(createdMedicalHistory))
                      .Returns(medicalHistoryDto);

            // Act
            // FIXED: Use correct method name
            var result = await _medicalHistoryService.CreateMedicalHistoryAsync(medicalHistoryDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New personal history", result.PersonalHistory);
            Assert.Equal("New allergies", result.Allergies);
        }

        [Fact]
        public async Task UpdateMedicalHistoryAsync_ValidMedicalHistory_UpdatesSuccessfully()
        {
            // Arrange
            var medicalHistoryDto = new MedicalHistoryDto
            {
                Id = 1,
                UserId = 1,
                PersonalHistory = "Updated personal history",
                FamilyHistory = "Updated family history",
                Allergies = "Updated allergies",
                HasAsthma = false,
                HasBloodPressure = true,
                CurrentMedications = "Updated medications"
            };
            var medicalHistory = new MedicalHistory
            {
                Id = 1,
                UserId = 1,
                PersonalHistory = "Updated personal history",
                FamilyHistory = "Updated family history",
                Allergies = "Updated allergies",
                HasAsthma = false,
                HasBloodPressure = true,
                CurrentMedications = "Updated medications"
            };

            _mockMapper.Setup(m => m.Map<MedicalHistory>(medicalHistoryDto))
                      .Returns(medicalHistory);
            _mockRepository.Setup(r => r.Update(It.IsAny<MedicalHistory>()))
                          .Returns(Task.CompletedTask);

            // Act
            // FIXED: Use correct method signature
            await _medicalHistoryService.UpdateMedicalHistoryAsync(medicalHistoryDto);

            // Assert
            _mockRepository.Verify(r => r.Update(It.IsAny<MedicalHistory>()), Times.Once);
        }

        [Fact]
        public async Task DeleteMedicalHistoryAsync_ValidId_DeletesSuccessfully()
        {
            // Arrange
            var medicalHistoryId = 1;

            _mockRepository.Setup(r => r.DeleteAsync(medicalHistoryId))
                          .Returns(Task.CompletedTask);

            // Act
            await _medicalHistoryService.DeleteMedicalHistoryAsync(medicalHistoryId);

            // Assert
            _mockRepository.Verify(r => r.DeleteAsync(medicalHistoryId), Times.Once);
        }

        public void Dispose()
        {
            // Clean up resources if needed
            _medicalHistoryService?.Dispose();
        }
    }
}
