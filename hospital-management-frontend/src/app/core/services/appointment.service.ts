import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';
import { AppointmentDto, CreateAppointmentDto, DoctorAvailabilityDto } from '../models';

@Injectable({
	providedIn: 'root'
})
export class AppointmentService extends BaseService {
	private readonly apiUrl = `${environment.apiUrl}/api/Appointments`;

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
}
