import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ChatMessage } from './signalr.service';

export interface Message {
	id?: number;
	senderId: number;
	receiverId: number;
	subject: string;
	messageContent: string;
	isRead: boolean;
	sentDate?: Date;
}

export interface Conversation {
	id: string;
	participants: ConversationParticipant[];
	lastMessage?: ChatMessage;
	lastMessageAt: Date;
	unreadCount: number;
	conversationType: 'private' | 'group' | 'medical_team';
	title?: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ConversationParticipant {
	userId: number;
	userName: string;
	userType: 'Patient' | 'Doctor' | 'Admin';
	avatar?: string;
	isOnline: boolean;
	lastSeen: Date;
}

export interface MessageAttachment {
	id: string;
	fileName: string;
	fileSize: number;
	fileType: string;
	url: string;
	thumbnailUrl?: string;
}

@Injectable({
	providedIn: 'root'
})
export class MessageService {
	private readonly apiUrl = `${environment.apiUrl}/messages`;

	private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
	private activeConversationSubject = new BehaviorSubject<Conversation | null>(null);
	private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);

	public conversations$ = this.conversationsSubject.asObservable();
	public activeConversation$ = this.activeConversationSubject.asObservable();
	public messages$ = this.messagesSubject.asObservable();


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

	// sendMessage(message: Message): Observable<Message> {
	// 	return this.http.post<Message>(this.apiUrl, message);
	// }

	markAsRead(id: number): Observable<any> {
		return this.http.put(`${this.apiUrl}/mark-as-read/${id}`, {});
	}

	deleteMessage(id: number): Observable<any> {
		return this.http.delete(`${this.apiUrl}/${id}`);
	}

	// Conversation methods
	getConversations(): Observable<Conversation[]> {
		return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`)
			.pipe(
				map(conversations => {
					this.conversationsSubject.next(conversations);
					return conversations;
				}),
				catchError(error => {
					console.error('Error loading conversations:', error);
					return this.getMockConversations();
				})
			);
	}

	getConversationById(conversationId: string): Observable<Conversation> {
		return this.http.get<Conversation>(`${this.apiUrl}/conversations/${conversationId}`)
			.pipe(
				catchError(error => {
					console.error('Error loading conversation:', error);
					return this.getMockConversationById(conversationId);
				})
			);
	}

	createConversation(participants: number[], conversationType: string = 'private', title?: string): Observable<Conversation> {
		const conversationData = {
			participants,
			conversationType,
			title
		};

		return this.http.post<Conversation>(`${this.apiUrl}/conversations`, conversationData)
			.pipe(
				catchError(error => {
					console.error('Error creating conversation:', error);
					return this.createMockConversation(conversationData);
				})
			);
	}

	// Message methods
	getMessages(conversationId: string, page: number = 1, pageSize: number = 50): Observable<ChatMessage[]> {
		const params = { page: page.toString(), pageSize: pageSize.toString() };

		return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversations/${conversationId}/messages`, { params })
			.pipe(
				map(messages => {
					this.messagesSubject.next(messages);
					return messages;
				}),
				catchError(error => {
					console.error('Error loading messages:', error);
					return this.getMockMessages(conversationId);
				})
			);
	}

	sendMessage(conversationId: string, message: string, messageType: string = 'text', attachments?: File[]): Observable<ChatMessage> {
		const formData = new FormData();
		formData.append('conversationId', conversationId);
		formData.append('message', message);
		formData.append('messageType', messageType);

		if (attachments && attachments.length > 0) {
			attachments.forEach((file, index) => {
				formData.append(`attachments[${index}]`, file);
			});
		}

		return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, formData)
			.pipe(
				catchError(error => {
					console.error('Error sending message:', error);
					return this.createMockMessage(conversationId, message, messageType);
				})
			);
	}

	markMessagesAsRead(conversationId: string, messageIds: string[]): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/conversations/${conversationId}/mark-read`, { messageIds })
			.pipe(
				catchError(error => {
					console.error('Error marking messages as read:', error);
					return of(undefined);
				})
			);
	}

	// File upload methods
	uploadAttachment(file: File): Observable<MessageAttachment> {
		const formData = new FormData();
		formData.append('file', file);

		return this.http.post<MessageAttachment>(`${this.apiUrl}/attachments`, formData)
			.pipe(
				catchError(error => {
					console.error('Error uploading attachment:', error);
					return this.createMockAttachment(file);
				})
			);
	}

	// Search methods
	searchMessages(query: string, conversationId?: string): Observable<ChatMessage[]> {
		const params: any = { query };
		if (conversationId) {
			params.conversationId = conversationId;
		}

		return this.http.get<ChatMessage[]>(`${this.apiUrl}/search`, { params })
			.pipe(
				catchError(error => {
					console.error('Error searching messages:', error);
					return of([]);
				})
			);
	}

	// State management methods
	setActiveConversation(conversation: Conversation | null): void {
		this.activeConversationSubject.next(conversation);
	}

	updateConversationLastMessage(conversationId: string, message: ChatMessage): void {
		const conversations = this.conversationsSubject.value;
		const conversationIndex = conversations.findIndex(c => c.id === conversationId);

		if (conversationIndex >= 0) {
			conversations[conversationIndex].lastMessage = message;
			conversations[conversationIndex].lastMessageAt = message.timestamp;
			this.conversationsSubject.next([...conversations]);
		}
	}

	incrementUnreadCount(conversationId: string): void {
		const conversations = this.conversationsSubject.value;
		const conversationIndex = conversations.findIndex(c => c.id === conversationId);

		if (conversationIndex >= 0) {
			conversations[conversationIndex].unreadCount++;
			this.conversationsSubject.next([...conversations]);
		}
	}

	resetUnreadCount(conversationId: string): void {
		const conversations = this.conversationsSubject.value;
		const conversationIndex = conversations.findIndex(c => c.id === conversationId);

		if (conversationIndex >= 0) {
			conversations[conversationIndex].unreadCount = 0;
			this.conversationsSubject.next([...conversations]);
		}
	}

	// Mock data methods for development
	private getMockConversations(): Observable<Conversation[]> {
		const mockConversations: Conversation[] = [
			{
				id: 'conv-1',
				participants: [
					{
						userId: 1,
						userName: 'Dr. Sarah Johnson',
						userType: 'Doctor',
						avatar: '/assets/avatars/doctor-1.jpg',
						isOnline: true,
						lastSeen: new Date()
					},
					{
						userId: 2,
						userName: 'John Doe',
						userType: 'Patient',
						avatar: '/assets/avatars/patient-1.jpg',
						isOnline: false,
						lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
					}
				],
				lastMessageAt: new Date(),
				unreadCount: 2,
				conversationType: 'private',
				title: 'Medical Consultation',
				createdAt: new Date('2024-12-01'),
				updatedAt: new Date()
			}
		];

		return of(mockConversations);
	}

	private getMockConversationById(conversationId: string): Observable<Conversation> {
		return this.getMockConversations().pipe(
			map(conversations => conversations.find(c => c.id === conversationId) || conversations[0])
		);
	}

	private getMockMessages(conversationId: string): Observable<ChatMessage[]> {
		const mockMessages: ChatMessage[] = [
			{
				id: 'msg-1',
				senderId: 1,
				senderName: 'Dr. Sarah Johnson',
				receiverId: 2,
				receiverName: 'John Doe',
				message: 'Hello John, how are you feeling today?',
				timestamp: new Date(Date.now() - 3600000), // 1 hour ago
				messageType: 'text',
				isRead: true,
				conversationId: conversationId
			},
			{
				id: 'msg-2',
				senderId: 2,
				senderName: 'John Doe',
				receiverId: 1,
				receiverName: 'Dr. Sarah Johnson',
				message: 'I\'m feeling much better, thank you for asking!',
				timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
				messageType: 'text',
				isRead: false,
				conversationId: conversationId
			}
		];

		return of(mockMessages);
	}

	private createMockConversation(data: any): Observable<Conversation> {
		const mockConversation: Conversation = {
			id: `conv-${Date.now()}`,
			participants: [],
			lastMessageAt: new Date(),
			unreadCount: 0,
			conversationType: data.conversationType,
			title: data.title,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		return of(mockConversation);
	}

	private createMockMessage(conversationId: string, message: string, messageType: string): Observable<ChatMessage> {
		const mockMessage: ChatMessage = {
			id: `msg-${Date.now()}`,
			senderId: 1,
			senderName: 'Current User',
			receiverId: 2,
			receiverName: 'Recipient',
			message,
			timestamp: new Date(),
			messageType: messageType as any,
			isRead: false,
			conversationId
		};

		return of(mockMessage);
	}

	private createMockAttachment(file: File): Observable<MessageAttachment> {
		const mockAttachment: MessageAttachment = {
			id: `att-${Date.now()}`,
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type,
			url: URL.createObjectURL(file),
			thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
		};

		return of(mockAttachment);
	}
}
