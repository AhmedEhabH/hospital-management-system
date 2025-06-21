export interface MessageDto {
	id: number;
	senderId: number;
	receiverId: number;
	subject: string;
	messageContent: string;
	isRead: boolean;
	sentDate: string; // ISO date string
}
