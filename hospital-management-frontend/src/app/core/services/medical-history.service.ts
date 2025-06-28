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

	/**
   * Retrieves all medical history records for a specific user/patient
   * 
   * @param userId - The unique identifier of the patient/user
   * @returns Observable<MedicalHistoryDto[]> - Array of medical history records
   */
	getMedicalHistoryByUserId(userId: number): Observable<MedicalHistoryDto[]> {
		return this.http.get<MedicalHistoryDto[]>(`${this.apiUrl}/user/${userId}`)
			.pipe(catchError(this.handleError));
	}

	/**
	 * Retrieves a specific medical history record by its unique identifier
	 * 
	 * @param id - The unique identifier of the medical history record
	 * @returns Observable<MedicalHistoryDto> - Single medical history record
	 */
	getMedicalHistoryById(id: number): Observable<MedicalHistoryDto> {
		return this.http.get<MedicalHistoryDto>(`${this.apiUrl}/${id}`)
			.pipe(catchError(this.handleError));
	}
	/**
   * Creates a new medical history record for a patient
   * 
   * @param medicalHistory - Complete medical history data transfer object
   * @returns Observable<MedicalHistoryDto> - The created medical history record with assigned ID
   */
	createMedicalHistory(medicalHistory: MedicalHistoryDto): Observable<MedicalHistoryDto> {
		return this.http.post<MedicalHistoryDto>(this.apiUrl, medicalHistory)
			.pipe(catchError(this.handleError));
	}

	/**
   * Updates an existing medical history record
   * 
   * @param id - The unique identifier of the medical history record to update
   * @param medicalHistory - Updated medical history data
   * @returns Observable<void> - Completion signal indicating successful update
   */
	updateMedicalHistory(id: number, medicalHistory: MedicalHistoryDto): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/${id}`, medicalHistory)
			.pipe(catchError(this.handleError));
	}

	/**
   * Deletes a medical history record
   * 
   * @param id - The unique identifier of the medical history record to delete
   * @returns Observable<void> - Completion signal indicating successful deletion
   */
	deleteMedicalHistory(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`)
			.pipe(catchError(this.handleError));
	}
}
