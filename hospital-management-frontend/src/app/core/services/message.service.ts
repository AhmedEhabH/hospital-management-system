import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
	id?: number;
	senderId: number;
	receiverId: number;
	subject: string;
	messageContent: string;
	isRead: boolean;
	sentDate?: Date;
}

@Injectable({
	providedIn: 'root'
})
export class MessageService {
	private readonly apiUrl = `${environment.apiUrl}/messages`;

	constructor(private http: HttpClient) { }

	getInbox(userId: number): Observable<Message[]> {
		return this.http.get<Message[]>(`${this.apiUrl}/inbox/${userId}`);
	}

	getSent(userId: number): Observable<Message[]> {
		return this.http.get<Message[]>(`${this.apiUrl}/sent/${userId}`);
	}

	getMessageById(id: number): Observable<Message> {
		return this.http.get<Message>(`${this.apiUrl}/${id}`);
	}

	sendMessage(message: Message): Observable<Message> {
		return this.http.post<Message>(this.apiUrl, message);
	}

	markAsRead(id: number): Observable<any> {
		return this.http.put(`${this.apiUrl}/mark-as-read/${id}`, {});
	}

	deleteMessage(id: number): Observable<any> {
		return this.http.delete(`${this.apiUrl}/${id}`);
	}
}
