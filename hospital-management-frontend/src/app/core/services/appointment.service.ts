import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';
import { AppointmentDto, CreateAppointmentDto, DoctorAvailabilityDto } from '../models';

@Injectable({
	providedIn: 'root'
})
export class AppointmentService extends BaseService {
	private readonly apiUrl = `${environment.apiUrl}/api/Appointments`;

	// Real-time appointment updates
	private appointmentsSubject = new BehaviorSubject<AppointmentDto[]>([]);
	public appointments$ = this.appointmentsSubject.asObservable();

	constructor(private http: HttpClient) {
		super();
	}

	getDoctorAppointments(doctorId: number, start: Date, end: Date): Observable<AppointmentDto[]> {
		const params = new HttpParams()
			.set('startDate', start.toISOString())
			.set('endDate', end.toISOString());
		return this.http.get<AppointmentDto[]>(`${this.apiUrl}/doctor/${doctorId}`, { params })
			.pipe(catchError(this.handleError));
	}

	getDoctorAvailability(doctorId: number, date: Date): Observable<DoctorAvailabilityDto> {
		const params = new HttpParams().set('date', date.toISOString());
		return this.http.get<DoctorAvailabilityDto>(`${this.apiUrl}/availability/doctor/${doctorId}`, { params })
			.pipe(catchError(this.handleError));
	}

	createAppointment(appointment: CreateAppointmentDto): Observable<AppointmentDto> {
		return this.http.post<AppointmentDto>(this.apiUrl, appointment)
			.pipe(catchError(this.handleError));
	}

	/**
   * Get specific appointment by ID
   */
	getAppointmentById(id: number): Observable<AppointmentDto> {
		return this.http.get<AppointmentDto>(`${this.apiUrl}/${id}`)
			.pipe(catchError(this.handleError));
	}

	/**
	 * Update appointment status
	 */
	updateAppointmentStatus(id: number, status: string): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/${id}/status`, { status })
			.pipe(
				tap(() => this.refreshAppointments()),
				catchError(this.handleError)
			);
	}

	/**
	 * Refresh appointments (for real-time updates)
	 */
	private refreshAppointments(): void {
		// This will be called when SignalR receives updates
		const currentAppointments = this.appointmentsSubject.value;
		this.appointmentsSubject.next([...currentAppointments]);
	}

	/**
	 * Update appointments from SignalR
	 */
	public updateAppointmentsFromSignalR(appointments: AppointmentDto[]): void {
		this.appointmentsSubject.next(appointments);
	}
}
