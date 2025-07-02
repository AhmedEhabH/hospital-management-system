import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService extends BaseService{
	apiUrl = `${environment.apiUrl}`
  constructor(
	private http: HttpClient
  ) { 
	super();
  }

  createFeedback(data:any):Observable<any>{
	return this.http.post<any>(`${this.apiUrl}/api/Feedback`, data);
  }
}
