using AutoMapper;
using HospitalManagement.API.Models.DTOs;
using HospitalManagement.API.Models.Entities;

namespace HospitalManagement.API.Utilities
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles() {
            CreateMap<User, UserRegistrationDto>().ReverseMap();
            CreateMap<User, LoginDto>().ReverseMap();
            CreateMap<User, UserInfoDto>().ReverseMap();
            CreateMap<MedicalHistory, MedicalHistoryDto>().ReverseMap();
            CreateMap<Feedback, FeedbackDto>().ReverseMap();
            CreateMap<LabReport, LabReportDto>().ReverseMap();
            CreateMap<Message, MessageDto>().ReverseMap();
            CreateMap<HospitalInfo, HospitalInfoDto>().ReverseMap();
            CreateMap<DoctorProfile, DoctorProfileDto>().ReverseMap();
        }
    }
}
