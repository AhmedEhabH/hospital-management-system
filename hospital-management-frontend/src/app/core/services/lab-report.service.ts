import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LabReport {
  id?: number;
  patientId: number;
  testedBy: string;
  testPerformed: string;
  phLevel?: number;
  cholesterolLevel?: number;
  sucroseLevel?: number;
  whiteBloodCellsRatio?: number;
  redBloodCellsRatio?: number;
  heartBeatRatio?: number;
  reports: string;
  testedDate: Date;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LabReportService {
  private readonly apiUrl = `${environment.apiUrl}/labreports`;

  constructor(private http: HttpClient) {}

  getLabReportsByPatientId(patientId: number): Observable<LabReport[]> {
    return this.http.get<LabReport[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getLabReportById(id: number): Observable<LabReport> {
    return this.http.get<LabReport>(`${this.apiUrl}/${id}`);
  }

  createLabReport(labReport: LabReport): Observable<LabReport> {
    return this.http.post<LabReport>(this.apiUrl, labReport);
  }

  updateLabReport(id: number, labReport: LabReport): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, labReport);
  }

  deleteLabReport(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
