import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicalHistory {
	id?: number;
	userId: number;
	personalHistory: string;
	familyHistory: string;
	allergies: string;
	frequentlyOccurringDisease: string;
	hasAsthma: boolean;
	hasBloodPressure: boolean;
	hasCholesterol: boolean;
	hasDiabetes: boolean;
	hasHeartDisease: boolean;
	usesTobacco: boolean;
	cigarettePacksPerDay: number;
	smokingYears: number;
	drinksAlcohol: boolean;
	alcoholicDrinksPerWeek: number;
	currentMedications: string;
	createdAt?: Date;
	updatedAt?: Date;
}

@Injectable({
	providedIn: 'root'
})
export class MedicalHistoryService {
	private readonly apiUrl = `${environment.apiUrl}/medicalhistory`;

	constructor(private http: HttpClient) { }

	getMedicalHistoriesByUserId(userId: number): Observable<MedicalHistory[]> {
		return this.http.get<MedicalHistory[]>(`${this.apiUrl}/user/${userId}`);
	}

	getMedicalHistoryById(id: number): Observable<MedicalHistory> {
		return this.http.get<MedicalHistory>(`${this.apiUrl}/${id}`);
	}

	createMedicalHistory(medicalHistory: MedicalHistory): Observable<MedicalHistory> {
		return this.http.post<MedicalHistory>(this.apiUrl, medicalHistory);
	}

	updateMedicalHistory(id: number, medicalHistory: MedicalHistory): Observable<any> {
		return this.http.put(`${this.apiUrl}/${id}`, medicalHistory);
	}

	deleteMedicalHistory(id: number): Observable<any> {
		return this.http.delete(`${this.apiUrl}/${id}`);
	}
}
