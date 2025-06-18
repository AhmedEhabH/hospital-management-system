import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Message {
	id: number;
	senderId: number;
	receiverId: number;
	subject: string;
	messageContent: string;
	isRead: boolean;
	sentDate: Date;
	// Extended properties for chat functionality
	senderName?: string | null;
	receiverName?: string | null;
	messageType?: 'text' | 'image' | 'file' | 'system';
	attachmentUrl?: string;
	attachmentName?: string;
	conversationId?: string;
}

// FIXED: Update ChatMessage interface to match SignalR interface exactly
export interface ChatMessage {
	id: string;
	senderId: number;
	senderName: string | null; // Allow null for SignalR compatibility
	receiverId: number;
	receiverName: string;
	message: string; // Maps to messageContent in Message
	timestamp: Date; // Maps to sentDate in Message
	messageType: 'text' | 'image' | 'file' | 'system';
	isRead: boolean;
	conversationId: string;
	attachmentUrl?: string;
	attachmentName?: string;
}

export interface Conversation {
	id: string;
	participants: ConversationParticipant[];
	lastMessage?: Message | null;
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
	private messagesSubject = new BehaviorSubject<Message[]>([]);
	private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
	private activeConversationSubject = new BehaviorSubject<Conversation | null>(null);

	public messages$ = this.messagesSubject.asObservable();
	public conversations$ = this.conversationsSubject.asObservable();
	public activeConversation$ = this.activeConversationSubject.asObservable();

	constructor(private http: HttpClient) { }

	// FIXED: Add missing getInbox method
	getInbox(userId: number): Observable<Message[]> {
		return this.http.get<Message[]>(`${this.apiUrl}/inbox/${userId}`)
			.pipe(
				map(messages => {
					this.messagesSubject.next(messages);
					return messages;
				}),
				catchError(error => {
					console.log('API endpoint not available, using mock data for inbox');
					return this.getMockInboxMessages(userId);
				})
			);
	}

	// FIXED: Add missing resetUnreadCount method
	resetUnreadCount(conversationId: string): void {
		const conversations = this.conversationsSubject.value;
		const conversationIndex = conversations.findIndex(c => c.id === conversationId);

		if (conversationIndex >= 0) {
			conversations[conversationIndex].unreadCount = 0;
			this.conversationsSubject.next([...conversations]);
		}
	}

	// FIXED: Add missing markMessagesAsRead method
	markMessagesAsRead(conversationId: string, messageIds: string[]): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/conversations/${conversationId}/mark-read`, { messageIds })
			.pipe(
				catchError(error => {
					console.log('API endpoint not available for mark messages as read');
					return of(undefined);
				})
			);
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
					console.log('API endpoint not available, using mock data for conversations');
					return this.getMockConversations();
				})
			);
	}

	getMessages(conversationId: string, page: number = 1, pageSize: number = 50): Observable<Message[]> {
		const params = { page: page.toString(), pageSize: pageSize.toString() };

		return this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}/messages`, { params })
			.pipe(
				map(messages => {
					this.messagesSubject.next(messages);
					return messages;
				}),
				catchError(error => {
					console.log('API endpoint not available, using mock data for messages');
					return this.getMockMessages(conversationId);
				})
			);
	}

	sendMessage(conversationId: string, message: string, messageType: string = 'text', attachments?: File[]): Observable<Message> {
		const formData = new FormData();
		formData.append('conversationId', conversationId);
		formData.append('messageContent', message);
		formData.append('subject', 'Chat Message');
		formData.append('messageType', messageType);

		if (attachments && attachments.length > 0) {
			attachments.forEach((file, index) => {
				formData.append(`attachments[${index}]`, file);
			});
		}

		return this.http.post<Message>(`${this.apiUrl}`, formData)
			.pipe(
				catchError(error => {
					console.log('API endpoint not available, using mock data for send message');
					return this.createMockMessage(conversationId, message, messageType);
				})
			);
	}

	markAsRead(messageId: number): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/mark-as-read/${messageId}`, {})
			.pipe(
				catchError(error => {
					console.log('API endpoint not available for mark as read');
					return of(undefined);
				})
			);
	}

	uploadAttachment(file: File): Observable<MessageAttachment> {
		const formData = new FormData();
		formData.append('file', file);

		return this.http.post<MessageAttachment>(`${this.apiUrl}/attachments`, formData)
			.pipe(
				catchError(error => {
					console.log('API endpoint not available, creating mock attachment');
					return this.createMockAttachment(file);
				})
			);
	}

	// State management methods
	setActiveConversation(conversation: Conversation | null): void {
		this.activeConversationSubject.next(conversation);
	}

	// FIXED: Update method to handle Message type properly
	updateConversationLastMessage(conversationId: string, message: Message): void {
		const conversations = this.conversationsSubject.value;
		const conversationIndex = conversations.findIndex(c => c.id === conversationId);

		if (conversationIndex >= 0) {
			conversations[conversationIndex].lastMessage = message;
			conversations[conversationIndex].lastMessageAt = message.sentDate;
			this.conversationsSubject.next([...conversations]);
		}
	}

	// FIXED: Enhanced utility method to convert ChatMessage to Message with proper null safety
	convertChatMessageToMessage(chatMessage: ChatMessage): Message {
		return {
			id: parseInt(chatMessage.id),
			senderId: chatMessage.senderId,
			receiverId: chatMessage.receiverId,
			subject: 'Chat Message',
			messageContent: chatMessage.message,
			isRead: chatMessage.isRead,
			sentDate: chatMessage.timestamp,
			senderName: chatMessage.senderName || 'Unknown User',
			receiverName: chatMessage.receiverName || 'Unknown User',
			messageType: chatMessage.messageType,
			conversationId: chatMessage.conversationId,
			attachmentUrl: chatMessage.attachmentUrl,
			attachmentName: chatMessage.attachmentName
		};
	}

	// FIXED: Enhanced utility method to convert Message to ChatMessage with proper null safety
	convertMessageToChatMessage(message: Message): ChatMessage {
		return {
			id: message.id.toString(),
			senderId: message.senderId,
			senderName: message.senderName || 'Unknown User',
			receiverId: message.receiverId,
			receiverName: message.receiverName || 'Unknown User',
			message: message.messageContent,
			timestamp: message.sentDate,
			messageType: message.messageType || 'text',
			isRead: message.isRead,
			conversationId: message.conversationId || '',
			attachmentUrl: message.attachmentUrl,
			attachmentName: message.attachmentName
		};
	}

	// Mock data methods for development
	private getMockInboxMessages(userId: number): Observable<Message[]> {
		const mockMessages: Message[] = [
			{
				id: 1,
				senderId: 2,
				receiverId: userId,
				subject: 'Medical Consultation Follow-up',
				messageContent: 'Please schedule your follow-up appointment for next week.',
				isRead: false,
				sentDate: new Date(Date.now() - 3600000),
				senderName: 'Dr. Sarah Johnson',
				receiverName: 'Patient',
				messageType: 'text',
				conversationId: 'conv-1'
			},
			{
				id: 2,
				senderId: 3,
				receiverId: userId,
				subject: 'Lab Results Available',
				messageContent: 'Your recent lab results are now available for review.',
				isRead: false,
				sentDate: new Date(Date.now() - 7200000),
				senderName: 'Lab Department',
				receiverName: 'Patient',
				messageType: 'text',
				conversationId: 'conv-2'
			}
		];

		return of(mockMessages);
	}

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
						userName: 'Admin User',
						userType: 'Admin',
						avatar: '/assets/avatars/admin-1.jpg',
						isOnline: false,
						lastSeen: new Date(Date.now() - 300000)
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

	private getMockMessages(conversationId: string): Observable<Message[]> {
		const mockMessages: Message[] = [
			{
				id: 1,
				senderId: 1,
				receiverId: 2,
				subject: 'Medical Consultation',
				messageContent: 'Hello, how are you feeling today?',
				isRead: true,
				sentDate: new Date(Date.now() - 3600000),
				senderName: 'Dr. Sarah Johnson',
				receiverName: 'Admin User',
				messageType: 'text',
				conversationId: conversationId
			},
			{
				id: 2,
				senderId: 2,
				receiverId: 1,
				subject: 'Medical Consultation',
				messageContent: 'I\'m feeling much better, thank you for asking!',
				isRead: false,
				sentDate: new Date(Date.now() - 3000000),
				senderName: 'Admin User',
				receiverName: 'Dr. Sarah Johnson',
				messageType: 'text',
				conversationId: conversationId
			}
		];

		return of(mockMessages);
	}

	private createMockMessage(conversationId: string, message: string, messageType: string): Observable<Message> {
		const mockMessage: Message = {
			id: Date.now(),
			senderId: 1,
			receiverId: 2,
			subject: 'Chat Message',
			messageContent: message,
			isRead: false,
			sentDate: new Date(),
			senderName: 'Current User',
			receiverName: 'Recipient',
			messageType: messageType as any,
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
