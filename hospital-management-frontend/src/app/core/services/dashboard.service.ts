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

	// **PATIENT DASHBOARD DATA**
	getPatientDashboardData(userId: number): Observable<PatientDashboardData> {
		return combineLatest([
			this.getUserInfo(userId),
			this.getMedicalHistoryByUser(userId),
			this.getLabReportsByPatient(userId),
			this.getInboxMessages(userId),
			this.getUpcomingAppointments(userId),
			this.getHealthMetrics(userId)
		]).pipe(
			map(([userInfo, medicalHistory, labReports, messages, appointments, healthMetrics]) => {
				const data: PatientDashboardData = {
					userInfo,
					medicalHistory,
					labReports,
					messages,
					upcomingAppointments: appointments,
					healthMetrics
				};
				this.patientDataSubject.next(data);
				return data;
			}),
			catchError(this.handleError<PatientDashboardData>('getPatientDashboardData'))
		);
	}

	// **DOCTOR DASHBOARD DATA**
	getDoctorDashboardData(doctorId: number): Observable<DoctorDashboardData> {
		return combineLatest([
			this.getUserInfo(doctorId),
			this.getDoctorPatients(doctorId),
			this.getTodayAppointments(doctorId),
			this.getCriticalLabReports(),
			this.getInboxMessages(doctorId),
			this.getDepartmentStats(doctorId)
		]).pipe(
			map(([userInfo, patients, appointments, criticalReports, messages, stats]) => {
				const data: DoctorDashboardData = {
					userInfo,
					patients,
					todayAppointments: appointments,
					criticalLabReports: criticalReports,
					pendingMessages: messages,
					departmentStats: stats
				};
				this.doctorDataSubject.next(data);
				return data;
			}),
			catchError(this.handleError<DoctorDashboardData>('getDoctorDashboardData'))
		);
	}

	// **ADMIN DASHBOARD DATA**
	getAdminDashboardData(): Observable<AdminDashboardData> {
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
				return data;
			}),
			catchError(this.handleError<AdminDashboardData>('getAdminDashboardData'))
		);
	}

	// **CORE API CALLS**
	private getUserInfo(userId: number): Observable<UserInfoDto> {
		return this.http.get<UserInfoDto>(`${this.apiUrl}/api/Auth/user/${userId}`);
	}

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

	// **DASHBOARD STATISTICS**
	getSystemStats(): Observable<DashboardStats> {
		return this.http.get<DashboardStats>(`${this.apiUrl}/api/Dashboard/stats`);
	}

	private getCriticalLabReports(): Observable<LabReportDto[]> {
		return this.http.get<LabReportDto[]>(`${this.apiUrl}/api/LabReports/critical`);
	}

	// **MOCK DATA METHODS (Replace with real API calls)**
	private getUpcomingAppointments(userId: number): Observable<any[]> {
		// TODO: Replace with real API call when appointments module is implemented
		return new Observable(observer => {
			observer.next([
				{
					id: 1,
					doctorName: 'Dr. Smith',
					date: new Date(Date.now() + 86400000), // Tomorrow
					time: '10:00 AM',
					department: 'Cardiology',
					type: 'Follow-up'
				},
				{
					id: 2,
					doctorName: 'Dr. Johnson',
					date: new Date(Date.now() + 172800000), // Day after tomorrow
					time: '2:30 PM',
					department: 'General Medicine',
					type: 'Consultation'
				}
			]);
			observer.complete();
		});
	}

	private getHealthMetrics(userId: number): Observable<any> {
		// TODO: Replace with real API call when health metrics module is implemented
		return new Observable(observer => {
			observer.next({
				bloodPressure: { systolic: 120, diastolic: 80, status: 'Normal' },
				heartRate: { value: 72, status: 'Normal' },
				weight: { value: 70, unit: 'kg', trend: 'stable' },
				temperature: { value: 36.5, unit: '°C', status: 'Normal' }
			});
			observer.complete();
		});
	}

	private getDoctorPatients(doctorId: number): Observable<UserInfoDto[]> {
		// TODO: Replace with real API call when doctor-patient relationship is implemented
		return new Observable(observer => {
			observer.next([
				{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', userType: 'Patient', userId: 'P001' },
				{ id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', userType: 'Patient', userId: 'P002' }
			]);
			observer.complete();
		});
	}

	private getTodayAppointments(doctorId: number): Observable<any[]> {
		// TODO: Replace with real API call
		return new Observable(observer => {
			observer.next([
				{
					id: 1,
					patientName: 'John Doe',
					time: '09:00 AM',
					type: 'Consultation',
					status: 'Scheduled'
				},
				{
					id: 2,
					patientName: 'Jane Smith',
					time: '11:30 AM',
					type: 'Follow-up',
					status: 'In Progress'
				}
			]);
			observer.complete();
		});
	}

	private getDepartmentStats(doctorId: number): Observable<any> {
		// TODO: Replace with real API call
		return new Observable(observer => {
			observer.next({
				totalPatients: 45,
				todayAppointments: 8,
				pendingReports: 3,
				criticalCases: 1
			});
			observer.complete();
		});
	}

	private getUserActivity(): Observable<any[]> {
		// TODO: Replace with real API call
		return new Observable(observer => {
			observer.next([
				{ user: 'Dr. Smith', action: 'Reviewed lab report', timestamp: new Date() },
				{ user: 'Nurse Johnson', action: 'Updated patient record', timestamp: new Date() }
			]);
			observer.complete();
		});
	}

	private getSystemAlerts(): Observable<any[]> {
		// TODO: Replace with real API call
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

	// **ERROR HANDLING**
	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {
			console.error(`${operation} failed:`, error);

			// Let the app keep running by returning an empty result
			return new Observable<T>(observer => {
				observer.next(result as T);
				observer.complete();
			});
		};
	}
}