import { FeedbackDto, HospitalInfoDto, LabReportDto, MedicalHistoryDto, MessageDto, UserInfoDto } from ".";

export interface DashboardStats {
	totalPatients: number;
	totalDoctors: number;
	totalLabReports: number;
	criticalAlerts: number;
	pendingMessages: number;
	recentFeedback: number;
}

export interface PatientDashboardData {
	userInfo: UserInfoDto;
	medicalHistory: MedicalHistoryDto[];
	labReports: LabReportDto[];
	messages: MessageDto[];
	upcomingAppointments: any[];
	healthMetrics: any;
}

export interface DoctorDashboardData {
	userInfo: UserInfoDto;
	patients: UserInfoDto[];
	todayAppointments: any[];
	criticalLabReports: LabReportDto[];
	pendingMessages: MessageDto[];
	departmentStats: any;
}

export interface AdminDashboardData {
	hospitalInfo: HospitalInfoDto[];
	systemStats: DashboardStats;
	recentFeedback: FeedbackDto[];
	userActivity: any[];
	systemAlerts: any[];
}
