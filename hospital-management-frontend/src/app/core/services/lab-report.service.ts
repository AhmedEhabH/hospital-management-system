import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LabReportDto } from '../models/lab-report.model';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';

@Injectable({
	providedIn: 'root'
})
export class LabReportService extends BaseService {
	private readonly apiUrl = `${environment.apiUrl}/api/LabReports`;

	constructor(private http: HttpClient) {
		super();
	}

	getLabReportsByPatientId(patientId: number): Observable<LabReportDto[]> {
		return this.http.get<LabReportDto[]>(`${this.apiUrl}/patient/${patientId}`)
			.pipe(catchError(this.handleError));
	}

	getLabReportById(id: number): Observable<LabReportDto> {
		return this.http.get<LabReportDto>(`${this.apiUrl}/${id}`)
			.pipe(catchError(this.handleError));
	}

	createLabReport(labReport: LabReportDto): Observable<LabReportDto> {
		return this.http.post<LabReportDto>(this.apiUrl, labReport)
			.pipe(catchError(this.handleError));
	}

	updateLabReport(id: number, labReport: LabReportDto): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/${id}`, labReport)
			.pipe(catchError(this.handleError));
	}

	deleteLabReport(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`)
			.pipe(catchError(this.handleError));
	}
}

// REMOVED: LabReport, LabTrendData exports as they don't exist in this service
// These should be imported from the models folder instead
