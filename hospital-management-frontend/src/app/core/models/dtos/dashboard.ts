import { FeedbackDto, HospitalInfoDto, LabReportDto, MedicalHistoryDto, MessageDto, UserInfoDto } from ".";

export interface DashboardStatsDto {
	totalPatients: number;
	totalDoctors: number;
	totalAdmins: number;
	totalUsers: number;
	activeUsers: number;
	totalLabReports: number;
	criticalAlerts: number;
	pendingMessages: number;
	recentFeedback: number;
	systemUptime: string;
	serverLoad: number;
	databaseSize: string;
	dailyLogins: number;
	monthlyRegistrations: number;
	lastUpdated: string;
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

// export interface AdminDashboardData {
// 	hospitalInfo: HospitalInfoDto[];
// 	systemStats: DashboardStatsDto;
// 	recentFeedback: FeedbackDto[];
// 	userActivity: any[];
// 	systemAlerts: any[];
// }

export interface HealthTrend {
	date: string;
	bloodPressureSystolic: number;
	bloodPressureDiastolic: number;
	heartRate: number;
	weight: number;
	temperature: number;
}

export interface UserActivityDto {
	id: number;
	userName: string;
	userType: string;
	action: string;
	timestamp: string;
	ipAddress: string;
	status: string;
}
export interface SystemAlert {
	id: number;
	type: 'error' | 'warning' | 'info' | 'success'; // Changed from 'Critical' | 'Warning' | 'Info'
	message: string;
	timestamp: Date;
	isRead: boolean; // Changed from 'resolved' to 'isRead'
	priority: 'high' | 'medium' | 'low';
}

export interface SystemMetrics {
	totalUsers: number;
	activeUsers: number;
	totalDoctors: number;
	totalPatients: number;
	totalAdmins: number;
	systemUptime: string;
	serverLoad: number;
	databaseSize: string;
	dailyLogins: number;
	monthlyRegistrations: number;
}

export interface AdminDashboardData {
	systemStats: DashboardStatsDto;
	recentLabReports: LabReportDto[];
	recentUserActivities: UserActivityDto[]; // Correct property name
	hospitalInfo: HospitalInfoDto[];
	recentFeedback: FeedbackDto[];
	criticalAlerts: LabReportDto[];
	systemAlerts: SystemAlert[]; // Add this line if missing
}

// Add CurrentUser interface for type safety
export interface CurrentUser {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	userType: string;
	userId: string;
}