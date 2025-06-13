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
    public class HospitalServiceTests : IDisposable
    {
        private readonly Mock<IGenericRepository<HospitalInfo>> _mockHospitalInfoRepository;
        private readonly Mock<IMapper> _mockMapper;
        private readonly HospitalService _hospitalService;

        public HospitalServiceTests()
        {
            Log.Information("Setting up HospitalService unit tests");

            _mockHospitalInfoRepository = new Mock<IGenericRepository<HospitalInfo>>();
            _mockMapper = new Mock<IMapper>();

            _hospitalService = new HospitalService(
                _mockHospitalInfoRepository.Object,
                _mockMapper.Object);
        }

        [Fact]
        public async Task GetAllHospitalInfosAsync_ReturnsAllHospitals()
        {
            // Arrange
            Log.Information("Testing GetAllHospitalInfosAsync");

            var hospitalInfos = new List<HospitalInfo>
            {
                new HospitalInfo
                {
                    Id = 1,
                    HospitalName = "City General Hospital",
                    Address = "123 Medical Center Drive",
                    City = "Cairo"
                }
            };
            var hospitalInfoDtos = new List<HospitalInfoDto>
            {
                new HospitalInfoDto
                {
                    Id = 1,
                    HospitalName = "City General Hospital",
                    Address = "123 Medical Center Drive",
                    City = "Cairo"
                }
            };

            _mockHospitalInfoRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(hospitalInfos);
            _mockMapper.Setup(m => m.Map<IEnumerable<HospitalInfoDto>>(hospitalInfos))
                .Returns(hospitalInfoDtos);

            // Act
            var result = await _hospitalService.GetAllHospitalInfosAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result.First().HospitalName.Should().Be("City General Hospital");
            result.First().City.Should().Be("Cairo");

            Log.Information("GetAllHospitalInfosAsync test completed successfully");
        }

        [Fact]
        public async Task AddHospitalInfoAsync_ValidDto_ReturnsCreatedHospital()
        {
            // Arrange
            Log.Information("Testing AddHospitalInfoAsync with valid DTO");

            var dto = new HospitalInfoDto
            {
                HospitalName = "New Medical Center",
                Address = "456 Health Street",
                City = "Alexandria"
            };
            var entity = new HospitalInfo
            {
                Id = 1,
                HospitalName = "New Medical Center",
                Address = "456 Health Street",
                City = "Alexandria"
            };

            _mockMapper.Setup(m => m.Map<HospitalInfo>(dto)).Returns(entity);
            _mockHospitalInfoRepository.Setup(r => r.AddAsync(entity)).Returns(Task.CompletedTask);
            _mockHospitalInfoRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);
            _mockMapper.Setup(m => m.Map<HospitalInfoDto>(entity)).Returns(dto);

            // Act
            var result = await _hospitalService.AddHospitalInfoAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.HospitalName.Should().Be("New Medical Center");
            result.City.Should().Be("Alexandria");

            Log.Information("AddHospitalInfoAsync test completed successfully");
        }

        [Fact]
        public async Task UpdateHospitalInfoAsync_ExistingId_ReturnsTrue()
        {
            // Arrange
            Log.Information("Testing UpdateHospitalInfoAsync with existing ID");

            var id = 1;
            var dto = new HospitalInfoDto { Id = id, HospitalName = "Updated Hospital" };
            var entity = new HospitalInfo { Id = id, HospitalName = "Original Hospital" };

            _mockHospitalInfoRepository.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(entity);
            _mockMapper.Setup(m => m.Map(dto, entity));
            _mockHospitalInfoRepository.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            var result = await _hospitalService.UpdateHospitalInfoAsync(id, dto);

            // Assert
            result.Should().BeTrue();

            Log.Information("UpdateHospitalInfoAsync test completed successfully");
        }

        public void Dispose()
        {
            Log.Information("Disposing HospitalService unit tests");
        }
    }
}
