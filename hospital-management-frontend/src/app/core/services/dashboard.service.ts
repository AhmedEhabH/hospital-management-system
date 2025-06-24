import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, combineLatest, map, Observable } from 'rxjs';
import {
	AdminDashboardData, DashboardStatsDto, DoctorDashboardData, FeedbackDto, HospitalInfoDto, LabReportDto, MedicalHistoryDto, MessageDto, PatientDashboardData, SystemAlert, UserActivityDto, UserInfoDto
} from '../models';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})


export class DashboardService {
	private apiUrl = environment.apiUrl;

	// Real-time data subjects
	private dashboardStatsSubject = new BehaviorSubject<DashboardStatsDto | null>(null);
	private patientDataSubject = new BehaviorSubject<PatientDashboardData | null>(null);
	private doctorDataSubject = new BehaviorSubject<DoctorDashboardData | null>(null);
	private adminDataSubject = new BehaviorSubject<AdminDashboardData | null>(null);

	// Public observables
	public dashboardStats$ = this.dashboardStatsSubject.asObservable();
	public patientData$ = this.patientDataSubject.asObservable();
	public doctorData$ = this.doctorDataSubject.asObservable();
	public adminData$ = this.adminDataSubject.asObservable();

	constructor(private http: HttpClient) { }

	getPatientDashboardData(userId: number): Observable<PatientDashboardData> {
		console.log('Fetching patient dashboard data for user ID:', userId);

		return this.http.get<PatientDashboardData>(`${this.apiUrl}/api/Dashboard/patient/${userId}`)
			.pipe(
				map(data => {
					this.patientDataSubject.next(data);
					console.log('Patient dashboard data received:', data);
					return data;
				}),
				catchError(this.handleError<PatientDashboardData>('getPatientDashboardData'))
			);
	}

	getDoctorDashboardData(doctorId: number): Observable<DoctorDashboardData> {
		console.log('Fetching doctor dashboard data for doctor ID:', doctorId);

		return this.http.get<DoctorDashboardData>(`${this.apiUrl}/api/Dashboard/doctor/${doctorId}`)
			.pipe(
				map(data => {
					this.doctorDataSubject.next(data);
					console.log('Doctor dashboard data received:', data);
					return data;
				}),
				catchError(this.handleError<DoctorDashboardData>('getDoctorDashboardData'))
			);
	}

	getSystemStats(): Observable<DashboardStatsDto> {
		console.log('Fetching system dashboard statistics');

		return this.http.get<DashboardStatsDto>(`${this.apiUrl}/api/Dashboard/stats`)
			.pipe(
				map(stats => {
					this.dashboardStatsSubject.next(stats);
					console.log('System stats received:', stats);
					return stats;
				}),
				catchError(this.handleError<DashboardStatsDto>('getSystemStats'))
			);
	}

	getCriticalLabReports(): Observable<LabReportDto[]> {
		return this.http.get<LabReportDto[]>(`${this.apiUrl}/api/LabReports/critical`)
			.pipe(
				catchError(this.handleError<LabReportDto[]>('getCriticalLabReports', []))
			);
	}

	getRecentUserActivities(limit: number = 20): Observable<UserActivityDto[]> {
		return this.http.get<UserActivityDto[]>(`${this.apiUrl}/api/Dashboard/user-activities?limit=${limit}`)
			.pipe(
				catchError(this.handleError<UserActivityDto[]>('getRecentUserActivities', []))
			);
	}

	getHospitalInfo(): Observable<HospitalInfoDto[]> {
		return this.http.get<HospitalInfoDto[]>(`${this.apiUrl}/api/Hospital`)
			.pipe(
				catchError(this.handleError<HospitalInfoDto[]>('getHospitalInfo', []))
			);
	}

	getRecentFeedback(): Observable<FeedbackDto[]> {
		return this.http.get<FeedbackDto[]>(`${this.apiUrl}/api/Feedback`)
			.pipe(
				catchError(this.handleError<FeedbackDto[]>('getRecentFeedback', []))
			);
	}

	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {
			console.error(`${operation} failed:`, error);

			return new Observable<T>(observer => {
				observer.next(result as T);
				observer.complete();
			});
		};
	}

	// **UPDATED: Use new backend dashboard endpoints**
	// getPatientDashboardData(userId: number): Observable<PatientDashboardData> {
	// 	console.log('Fetching patient dashboard data for user ID:', userId);

	// 	return this.http.get<PatientDashboardData>(`${this.apiUrl}/api/Dashboard/patient/${userId}`)
	// 		.pipe(
	// 			map(data => {
	// 				this.patientDataSubject.next(data);
	// 				console.log('Patient dashboard data received:', data);
	// 				return data;
	// 			}),
	// 			catchError(this.handleError<PatientDashboardData>('getPatientDashboardData'))
	// 		);
	// }

	// getDoctorDashboardData(doctorId: number): Observable<DoctorDashboardData> {
	// 	console.log('Fetching doctor dashboard data for doctor ID:', doctorId);

	// 	return this.http.get<DoctorDashboardData>(`${this.apiUrl}/api/Dashboard/doctor/${doctorId}`)
	// 		.pipe(
	// 			map(data => {
	// 				this.doctorDataSubject.next(data);
	// 				console.log('Doctor dashboard data received:', data);
	// 				return data;
	// 			}),
	// 			catchError(this.handleError<DoctorDashboardData>('getDoctorDashboardData'))
	// 		);
	// }

	// getSystemStats(): Observable<DashboardStatsDto> {
	// 	console.log('Fetching system dashboard statistics');

	// 	return this.http.get<DashboardStatsDto>(`${this.apiUrl}/api/Dashboard/stats`)
	// 		.pipe(
	// 			map(stats => {
	// 				this.DashboardStatsDtoSubject.next(stats);
	// 				console.log('System stats received:', stats);
	// 				return stats;
	// 			}),
	// 			catchError(this.handleError<DashboardStatsDto>('getSystemStats'))
	// 		);
	// }

	getAdminDashboardData(): Observable<AdminDashboardData> {
		console.log('Fetching admin dashboard data');

		return combineLatest([
			this.getHospitalInfo(),
			this.getSystemStats(),
			this.getRecentFeedback(),
			this.getRecentUserActivities(20), // This method exists
			this.getSystemAlerts()
		]).pipe(
			map(([hospitalInfo, stats, feedback, userActivities, alerts]) => { // Fixed: userActivities instead of userActivity
				const data: AdminDashboardData = {
					hospitalInfo,
					systemStats: stats,
					recentFeedback: feedback,
					recentUserActivities: userActivities, // Fixed: Use correct property name
					systemAlerts: alerts,
					recentLabReports: [], // Add missing required properties
					criticalAlerts: []    // Add missing required properties
				};
				this.adminDataSubject.next(data);
				console.log('Admin dashboard data aggregated:', data);
				return data;
			}),
			catchError(this.handleError<AdminDashboardData>('getAdminDashboardData'))
		);
	}


	// **UPDATED: Use new backend endpoints**
	// getCriticalLabReports(): Observable<LabReportDto[]> {
	// 	return this.http.get<LabReportDto[]>(`${this.apiUrl}/api/LabReports/critical`)
	// 		.pipe(
	// 			catchError(this.handleError<LabReportDto[]>('getCriticalLabReports', []))
	// 		);
	// }

	getUserById(userId: number): Observable<UserInfoDto> {
		return this.http.get<UserInfoDto>(`${this.apiUrl}/api/Auth/user/${userId}`)
			.pipe(
				catchError(this.handleError<UserInfoDto>('getUserById'))
			);
	}

	// **EXISTING API ENDPOINTS**
	private getMedicalHistoryByUser(userId: number): Observable<MedicalHistoryDto[]> {
		return this.http.get<MedicalHistoryDto[]>(`${this.apiUrl}/api/MedicalHistory/user/${userId}`);
	}

	private getLabReportsByPatient(patientId: number): Observable<LabReportDto[]> {
		return this.http.get<LabReportDto[]>(`${this.apiUrl}/api/LabReports/patient/${patientId}`);
	}

	private getInboxMessages(userId: number): Observable<MessageDto[]> {
		return this.http.get<MessageDto[]>(`${this.apiUrl}/api/Messages/inbox/${userId}`);
	}

	// getHospitalInfo(): Observable<HospitalInfoDto[]> {
	// 	return this.http.get<HospitalInfoDto[]>(`${this.apiUrl}/api/Hospital`);
	// }

	// getRecentFeedback(): Observable<FeedbackDto[]> {
	// 	return this.http.get<FeedbackDto[]>(`${this.apiUrl}/api/Feedback`);
	// }

	// **MOCK DATA METHODS (Replace with real API calls when available)**
	private getUserActivity(): Observable<UserActivityDto[]> {
		return this.http.get<UserActivityDto[]>(`${this.apiUrl}/api/Dashboard/user-activities`);
	}

	private getSystemAlerts(): Observable<SystemAlert[]> {
		return this.http.get<SystemAlert[]>(`${this.apiUrl}/api/Dashboard/system-alerts`);
	}

	// **REFRESH METHODS**
	refreshPatientData(userId: number): void {
		this.getPatientDashboardData(userId).subscribe();
	}

	refreshDoctorData(doctorId: number): void {
		this.getDoctorDashboardData(doctorId).subscribe();
	}

	refreshAdminData(): void {
		this.getAdminDashboardData().subscribe();
	}

	refreshSystemStats(): void {
		this.getSystemStats().subscribe();
	}

	getPatientHealthTrends(patientId: number, days: number = 30): Observable<any[]> {
		return this.http.get<any[]>(`${this.apiUrl}/api/Dashboard/patient/${patientId}/health-trends?days=${days}`)
			.pipe(
				catchError(this.handleError<any[]>('getPatientHealthTrends', []))
			);
	}



	// **ERROR HANDLING**
	// private handleError<T>(operation = 'operation', result?: T) {
	// 	return (error: any): Observable<T> => {
	// 		console.error(`${operation} failed:`, error);

	// 		// Return empty result to keep app running
	// 		return new Observable<T>(observer => {
	// 			observer.next(result as T);
	// 			observer.complete();
	// 		});
	// 	};
	// }

	// Add these methods to your existing DashboardService class
	// getRecentUserActivities(limit: number = 20): Observable<any[]> {
	// 	// This will be implemented when the backend endpoint is ready
	// 	// For now, return mock data that matches the expected structure
	// 	return new Observable(observer => {
	// 		const mockActivities = [
	// 			{
	// 				id: 1,
	// 				userName: 'Dr. Smith',
	// 				userType: 'Doctor',
	// 				action: 'Reviewed lab report',
	// 				timestamp: new Date(Date.now() - 3600000), // 1 hour ago
	// 				status: 'Success',
	// 				ipAddress: '192.168.1.100'
	// 			},
	// 			{
	// 				id: 2,
	// 				userName: 'John Doe',
	// 				userType: 'Patient',
	// 				action: 'Updated medical history',
	// 				timestamp: new Date(Date.now() - 7200000), // 2 hours ago
	// 				status: 'Success',
	// 				ipAddress: '192.168.1.101'
	// 			},
	// 			{
	// 				id: 3,
	// 				userName: 'Admin User',
	// 				userType: 'Admin',
	// 				action: 'System configuration change',
	// 				timestamp: new Date(Date.now() - 10800000), // 3 hours ago
	// 				status: 'Warning',
	// 				ipAddress: '192.168.1.102'
	// 			}
	// 		];

	// 		observer.next(mockActivities.slice(0, limit));
	// 		observer.complete();
	// 	});
	// }

	// getSystemStats(): Observable<DashboardStatsDto> {
	// 	return this.http.get<DashboardStatsDto>(`${this.apiUrl}/api/Dashboard/stats`);
	// }

	// getCriticalLabReports(): Observable<LabReportDto[]> {
	// 	return this.http.get<LabReportDto[]>(`${this.apiUrl}/api/LabReports/critical`);
	// }

	// getRecentUserActivities(limit = 20): Observable<UserActivityDto[]> {
	// 	return this.http.get<UserActivityDto[]>(`${this.apiUrl}/api/Dashboard/user-activities?limit=${limit}`);
	// }

	// getHospitalInfo(): Observable<HospitalInfoDto[]> {
	// 	return this.http.get<HospitalInfoDto[]>(`${this.apiUrl}/api/Hospital`);
	// }

	// getRecentFeedback(): Observable<FeedbackDto[]> {
	// 	return this.http.get<FeedbackDto[]>(`${this.apiUrl}/api/Feedback`);
	// }

}