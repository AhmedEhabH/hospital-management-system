export interface CriticalAlertRequest {
	patientId: number;
	labReportId: number;
	alertMessage: string;
}

export interface AppointmentReminderRequest {
	patientId: number;
	appointmentDate: string; // ISO date string
	doctorName: string;
}

export interface EmergencyAlertRequest {
	patientId: number;
	emergencyDetails: string;
}

export interface NotificationData {
	title: string;
	message: string;
	type: 'medical' | 'appointment' | 'emergency' | 'system';
	priority: 'critical' | 'high' | 'medium' | 'low';
	timestamp: Date;
	actionUrl?: string;
	data?: any;
}

export interface MedicalAlert {
	id: string;
	patientId: number;
	patientName: string;
	alertType: 'critical' | 'warning' | 'info' | 'emergency';
	title: string;
	message: string;
	timestamp: Date;
	labReportId?: number;
	priority: 'high' | 'medium' | 'low';
	actionUrl?: string;
	acknowledged: boolean;
	doctorNotified: boolean;
}

export interface ChatMessage {
	id: string;
	senderId: number;
	receiverId: number;
	content: string;
	timestamp: Date;
	isRead: boolean;
	messageType: 'text' | 'image' | 'file';
	conversationId: string;
}

export interface UserPresence {
	userId: number;
	userName: string;
	isOnline: boolean;
	lastSeen: Date;
	status: 'online' | 'offline' | 'away' | 'busy';
}

export interface TypingIndicator {
	userId: number;
	userName: string;
	isTyping: boolean;
	conversationId: string;
}
export interface NotificationData {
	title: string;
	message: string;
	type: 'medical' | 'appointment' | 'emergency' | 'system';
	priority: 'critical' | 'high' | 'medium' | 'low';
	timestamp: Date;
	actionUrl?: string;
	data?: any;
}

export interface MedicalAlert {
	id: string;
	patientId: number;
	patientName: string;
	alertType: 'critical' | 'warning' | 'info' | 'emergency';
	title: string;
	message: string;
	timestamp: Date;
	labReportId?: number;
	priority: 'high' | 'medium' | 'low';
	actionUrl?: string;
	acknowledged: boolean;
	doctorNotified: boolean;
}

export interface ChatMessage {
	id: string;
	senderId: number;
	receiverId: number;
	content: string;
	timestamp: Date;
	isRead: boolean;
	messageType: 'text' | 'image' | 'file';
	conversationId: string;
}

export interface UserPresence {
	userId: number;
	userName: string;
	isOnline: boolean;
	lastSeen: Date;
	status: 'online' | 'offline' | 'away' | 'busy';
}

export interface TypingIndicator {
	userId: number;
	userName: string;
	isTyping: boolean;
	conversationId: string;
}

export interface ConversationItem {
	id: string;
	title: string;
	lastMessage: string;
	lastMessageTime: Date;
	unreadCount: number;
	participants: any[];
	isOnline: boolean;
	conversationType: 'direct' | 'group'; // FIXED: Add missing property
}

export interface FilePreview {
	file: File;
	preview?: string;
	type: string;
}

export interface Conversation {
	id: string;
	title: string;
	conversationType: 'direct' | 'group';
	participants: any[];
}
