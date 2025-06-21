export interface FeedbackDto {
	id: number;
	userId: number;
	userName: string;
	emailId: string;
	comments: string;
	createdAt: string; // ISO date string
}
