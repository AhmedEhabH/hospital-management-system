import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MedicalHistoryDto } from '../models/medical-history.model';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';

@Injectable({
	providedIn: 'root'
})
export class MedicalHistoryService extends BaseService {
	private readonly apiUrl = `${environment.apiUrl}/api/MedicalHistory`;

	constructor(private http: HttpClient) {
		super();
	}

	getMedicalHistoryByUserId(userId: number): Observable<MedicalHistoryDto[]> {
		return this.http.get<MedicalHistoryDto[]>(`${this.apiUrl}/user/${userId}`)
			.pipe(catchError(this.handleError));
	}

	getMedicalHistoryById(id: number): Observable<MedicalHistoryDto> {
		return this.http.get<MedicalHistoryDto>(`${this.apiUrl}/${id}`)
			.pipe(catchError(this.handleError));
	}

	createMedicalHistory(medicalHistory: MedicalHistoryDto): Observable<MedicalHistoryDto> {
		return this.http.post<MedicalHistoryDto>(this.apiUrl, medicalHistory)
			.pipe(catchError(this.handleError));
	}

	updateMedicalHistory(id: number, medicalHistory: MedicalHistoryDto): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/${id}`, medicalHistory)
			.pipe(catchError(this.handleError));
	}

	deleteMedicalHistory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`)
			.pipe(catchError(this.handleError));
	}
}
