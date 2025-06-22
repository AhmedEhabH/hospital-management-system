import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, combineLatest, map, Observable } from 'rxjs';
import { AdminDashboardData, DashboardStats, DoctorDashboardData, FeedbackDto, HospitalInfoDto, LabReportDto, MedicalHistoryDto, MessageDto, PatientDashboardData, UserInfoDto } from '../models/index';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})


export class DashboardService {
	private apiUrl = environment.apiUrl;

	// Real-time data subjects
	private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
	private patientDataSubject = new BehaviorSubject<PatientDashboardData | null>(null);
	private doctorDataSubject = new BehaviorSubject<DoctorDashboardData | null>(null);
	private adminDataSubject = new BehaviorSubject<AdminDashboardData | null>(null);

	// Public observables
	public dashboardStats$ = this.dashboardStatsSubject.asObservable();
	public patientData$ = this.patientDataSubject.asObservable();
	public doctorData$ = this.doctorDataSubject.asObservable();
	public adminData$ = this.adminDataSubject.asObservable();

	constructor(private http: HttpClient) { }

	// **UPDATED: Use new backend dashboard endpoints**
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

	getSystemStats(): Observable<DashboardStats> {
		console.log('Fetching system dashboard statistics');

		return this.http.get<DashboardStats>(`${this.apiUrl}/api/Dashboard/stats`)
			.pipe(
				map(stats => {
					this.dashboardStatsSubject.next(stats);
					console.log('System stats received:', stats);
					return stats;
				}),
				catchError(this.handleError<DashboardStats>('getSystemStats'))
			);
	}

	getAdminDashboardData(): Observable<AdminDashboardData> {
		console.log('Fetching admin dashboard data');

		return combineLatest([
			this.getHospitalInfo(),
			this.getSystemStats(),
			this.getRecentFeedback(),
			this.getUserActivity(),
			this.getSystemAlerts()
		]).pipe(
			map(([hospitalInfo, stats, feedback, activity, alerts]) => {
				const data: AdminDashboardData = {
					hospitalInfo,
					systemStats: stats,
					recentFeedback: feedback,
					userActivity: activity,
					systemAlerts: alerts
				};
				this.adminDataSubject.next(data);
				console.log('Admin dashboard data aggregated:', data);
				return data;
			}),
			catchError(this.handleError<AdminDashboardData>('getAdminDashboardData'))
		);
	}

	// **UPDATED: Use new backend endpoints**
	getCriticalLabReports(): Observable<LabReportDto[]> {
		return this.http.get<LabReportDto[]>(`${this.apiUrl}/api/LabReports/critical`)
			.pipe(
				catchError(this.handleError<LabReportDto[]>('getCriticalLabReports', []))
			);
	}

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

	private getHospitalInfo(): Observable<HospitalInfoDto[]> {
		return this.http.get<HospitalInfoDto[]>(`${this.apiUrl}/api/Hospital`);
	}

	private getRecentFeedback(): Observable<FeedbackDto[]> {
		return this.http.get<FeedbackDto[]>(`${this.apiUrl}/api/Feedback`);
	}

	// **MOCK DATA METHODS (Replace with real API calls when available)**
	private getUserActivity(): Observable<any[]> {
		return new Observable(observer => {
			observer.next([
				{ user: 'Dr. Smith', action: 'Reviewed lab report', timestamp: new Date() },
				{ user: 'Nurse Johnson', action: 'Updated patient record', timestamp: new Date() }
			]);
			observer.complete();
		});
	}

	private getSystemAlerts(): Observable<any[]> {
		return new Observable(observer => {
			observer.next([
				{ type: 'warning', message: 'Server maintenance scheduled', timestamp: new Date() },
				{ type: 'info', message: 'New feature available', timestamp: new Date() }
			]);
			observer.complete();
		});
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
	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {
			console.error(`${operation} failed:`, error);

			// Return empty result to keep app running
			return new Observable<T>(observer => {
				observer.next(result as T);
				observer.complete();
			});
		};
	}
}