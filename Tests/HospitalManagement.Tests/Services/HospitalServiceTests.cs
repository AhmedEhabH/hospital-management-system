using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;
using HospitalManagement.API.Repositories.Interfaces;
using HospitalManagement.API.Services.Implementations;
using Microsoft.Extensions.Logging;
using Moq;
using Serilog;
using Xunit;

namespace HospitalManagement.Tests.Services
{
    public class HospitalServiceTests : IDisposable
    {
        private readonly Mock<IGenericRepository<HospitalInfo>> _mockRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<ILogger<HospitalService>> _mockLogger;
        private readonly HospitalService _hospitalService;

        public HospitalServiceTests()
        {
            _mockRepository = new Mock<IGenericRepository<HospitalInfo>>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<HospitalService>>();

            // FIXED: Add logger parameter
            _hospitalService = new HospitalService(
                _mockRepository.Object,
                _mockMapper.Object,
                _mockLogger.Object
            );
        }

        [Fact]
        public async Task GetHospitalInfoByIdAsync_ValidId_ReturnsHospitalInfoDto()
        {
            // Arrange
            var hospitalId = 1;
            var hospitalInfo = new HospitalInfo
            {
                Id = hospitalId,
                HospitalName = "Test Hospital",
                Address = "123 Test Street",
                City = "Test City",
                PhoneNumber = "123-456-7890",
                Email = "test@hospital.com",
                Description = "Test hospital description",
                CreatedAt = DateTime.UtcNow
            };
            var hospitalInfoDto = new HospitalInfoDto
            {
                Id = hospitalId,
                HospitalName = "Test Hospital",
                Address = "123 Test Street",
                City = "Test City",
                PhoneNumber = "123-456-7890",
                Email = "test@hospital.com",
                Description = "Test hospital description",
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(r => r.GetByIdAsync(hospitalId))
                          .ReturnsAsync(hospitalInfo);
            _mockMapper.Setup(m => m.Map<HospitalInfoDto>(hospitalInfo))
                      .Returns(hospitalInfoDto);

            // Act
            var result = await _hospitalService.GetHospitalInfoByIdAsync(hospitalId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(hospitalId, result.Id);
            Assert.Equal("Test Hospital", result.HospitalName);
        }

        [Fact]
        public async Task GetAllHospitalInfoAsync_ReturnsHospitalInfoList()
        {
            // Arrange
            var hospitalInfos = new List<HospitalInfo>
            {
                new HospitalInfo
                {
                    Id = 1,
                    HospitalName = "Hospital 1",
                    Address = "123 Test Street",
                    City = "Test City",
                    CreatedAt = DateTime.UtcNow
                },
                new HospitalInfo
                {
                    Id = 2,
                    HospitalName = "Hospital 2",
                    Address = "456 Test Avenue",
                    City = "Test City",
                    CreatedAt = DateTime.UtcNow
                }
            };
            var hospitalInfoDtos = new List<HospitalInfoDto>
            {
                new HospitalInfoDto
                {
                    Id = 1,
                    HospitalName = "Hospital 1",
                    Address = "123 Test Street",
                    City = "Test City",
                    CreatedAt = DateTime.UtcNow
                },
                new HospitalInfoDto
                {
                    Id = 2,
                    HospitalName = "Hospital 2",
                    Address = "456 Test Avenue",
                    City = "Test City",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _mockRepository.Setup(r => r.GetAllAsync())
                          .ReturnsAsync(hospitalInfos);
            _mockMapper.Setup(m => m.Map<IEnumerable<HospitalInfoDto>>(hospitalInfos))
                      .Returns(hospitalInfoDtos);

            // Act
            // FIXED: Use correct method name
            var result = await _hospitalService.GetAllHospitalInfoAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task CreateHospitalInfoAsync_ValidHospitalInfo_ReturnsHospitalInfoDto()
        {
            // Arrange
            var hospitalInfoDto = new HospitalInfoDto
            {
                HospitalName = "New Hospital",
                Address = "789 New Street",
                City = "New City",
                PhoneNumber = "987-654-3210",
                Email = "new@hospital.com",
                Description = "New hospital description"
            };
            var hospitalInfo = new HospitalInfo
            {
                Id = 1,
                HospitalName = "New Hospital",
                Address = "789 New Street",
                City = "New City",
                PhoneNumber = "987-654-3210",
                Email = "new@hospital.com",
                Description = "New hospital description",
                CreatedAt = DateTime.UtcNow
            };
            var createdHospitalInfo = new HospitalInfo
            {
                Id = 1,
                HospitalName = "New Hospital",
                Address = "789 New Street",
                City = "New City",
                PhoneNumber = "987-654-3210",
                Email = "new@hospital.com",
                Description = "New hospital description",
                CreatedAt = DateTime.UtcNow
            };

            _mockMapper.Setup(m => m.Map<HospitalInfo>(hospitalInfoDto))
                      .Returns(hospitalInfo);
            // FIXED: Use correct return type for AddAsync
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<HospitalInfo>()))
                          .ReturnsAsync(createdHospitalInfo);
            _mockMapper.Setup(m => m.Map<HospitalInfoDto>(createdHospitalInfo))
                      .Returns(hospitalInfoDto);

            // Act
            // FIXED: Use correct method name
            var result = await _hospitalService.CreateHospitalInfoAsync(hospitalInfoDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Hospital", result.HospitalName);
        }

        [Fact]
        public async Task UpdateHospitalInfoAsync_ValidHospitalInfo_UpdatesSuccessfully()
        {
            // Arrange
            var hospitalInfoDto = new HospitalInfoDto
            {
                Id = 1,
                HospitalName = "Updated Hospital",
                Address = "Updated Address",
                City = "Updated City",
                PhoneNumber = "111-222-3333",
                Email = "updated@hospital.com",
                Description = "Updated description"
            };
            var hospitalInfo = new HospitalInfo
            {
                Id = 1,
                HospitalName = "Updated Hospital",
                Address = "Updated Address",
                City = "Updated City",
                PhoneNumber = "111-222-3333",
                Email = "updated@hospital.com",
                Description = "Updated description",
                UpdatedAt = DateTime.UtcNow
            };

            _mockMapper.Setup(m => m.Map<HospitalInfo>(hospitalInfoDto))
                      .Returns(hospitalInfo);
            _mockRepository.Setup(r => r.Update(It.IsAny<HospitalInfo>()))
                          .Returns(Task.CompletedTask);

            // Act
            // FIXED: Use correct method signature
            await _hospitalService.UpdateHospitalInfoAsync(hospitalInfoDto);

            // Assert
            _mockRepository.Verify(r => r.Update(It.IsAny<HospitalInfo>()), Times.Once);
        }

        [Fact]
        public async Task DeleteHospitalInfoAsync_ValidId_DeletesSuccessfully()
        {
            // Arrange
            var hospitalId = 1;

            _mockRepository.Setup(r => r.DeleteAsync(hospitalId))
                          .Returns(Task.CompletedTask);

            // Act
            await _hospitalService.DeleteHospitalInfoAsync(hospitalId);

            // Assert
            _mockRepository.Verify(r => r.DeleteAsync(hospitalId), Times.Once);
        }

        public void Dispose()
        {
            // Clean up resources if needed
            Log.Information("Disposing HospitalService unit tests");
        }
    }
}
