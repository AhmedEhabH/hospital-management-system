using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Utilities
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            // User mappings
            CreateMap<User, UserInfoDto>().ReverseMap();
            CreateMap<UserRegistrationDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            // Medical History mappings
            CreateMap<MedicalHistory, MedicalHistoryDto>().ReverseMap();

            // Feedback mappings
            CreateMap<Feedback, FeedbackDto>().ReverseMap();

            // Lab Report mappings
            CreateMap<LabReport, LabReportDto>().ReverseMap();

            // Message mappings
            CreateMap<Message, MessageDto>().ReverseMap();

            // Hospital Info mappings
            CreateMap<HospitalInfo, HospitalInfoDto>().ReverseMap();

            // ADDED: DoctorProfile mappings
            CreateMap<DoctorProfile, DoctorProfileDto>()
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.PhoneNo, opt => opt.MapFrom(src => src.User.PhoneNo))
                .ReverseMap()
                .ForMember(dest => dest.User, opt => opt.Ignore());

            // Add these mappings to your existing AutoMapperProfiles class
            CreateMap<UserActivity, UserActivityDto>().ReverseMap();
            CreateMap<Appointment, AppointmentDto>().ReverseMap();
            CreateMap<HealthMetric, HealthMetricsDto>()
                .ForMember(dest => dest.BloodPressure, opt => opt.MapFrom(src => new BloodPressureDto
                {
                    Systolic = src.BloodPressureSystolic,
                    Diastolic = src.BloodPressureDiastolic,
                    Status = "Normal" // Will be calculated in service
                }))
                .ForMember(dest => dest.HeartRate, opt => opt.MapFrom(src => new HeartRateDto
                {
                    Value = src.HeartRate,
                    Status = "Normal" // Will be calculated in service
                }))
                .ForMember(dest => dest.Weight, opt => opt.MapFrom(src => new WeightDto
                {
                    Value = src.Weight,
                    Unit = "kg",
                    Trend = "stable" // Will be calculated in service
                }))
                .ForMember(dest => dest.Temperature, opt => opt.MapFrom(src => new TemperatureDto
                {
                    Value = src.Temperature,
                    Unit = "°C",
                    Status = "Normal" // Will be calculated in service
                }));

        }
    }
}
