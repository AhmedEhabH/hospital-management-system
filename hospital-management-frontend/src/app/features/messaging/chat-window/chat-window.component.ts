import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalrService } from '../../../core/services/signalr.service';
import {
	ChatMessage,
	TypingIndicator,
	Conversation,
	FilePreview
} from '../../../core/models/dtos';

@Component({
	selector: 'app-chat-window',
	standalone: false,
	templateUrl: './chat-window.component.html',
	styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
	@Input() conversationId!: string;
	@Input() otherParticipant: any | null;
	// FIXED: Remove conversation input since it's not being used in template
	@ViewChild('messageInput') messageInput!: ElementRef;
	@ViewChild('fileInput') fileInput!: ElementRef;

	// Properties
	isDarkMode = false;
	conversation: Conversation | null = null;
	typingUsers: string[] = [];
	isLoading = false;
	isDragOver = false;
	messages: ChatMessage[] = [];
	selectedFiles: FilePreview[] = [];
	newMessage = '';
	allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'];

	private subscriptions: Subscription[] = [];
	private typingTimeout: any;

	constructor(public SignalrService: SignalrService) { }

	ngOnInit(): void {
		this.isDarkMode = document.body.classList.contains('dark-theme');
		this.loadConversation();
		this.subscribeToMessages();
		this.subscribeToTypingIndicators();
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
		if (this.typingTimeout) {
			clearTimeout(this.typingTimeout);
		}
	}

	private loadConversation(): void {
		if (this.conversationId) {
			this.isLoading = true;
			this.conversation = {
				id: this.conversationId.toString(),
				title: this.otherParticipant?.name || 'Medical Consultation',
				conversationType: 'private',
				participants: [this.otherParticipant],
				lastMessageAt: new Date(),
				unreadCount: 0,
				createdAt: new Date(),
				updatedAt: new Date()

			};
			this.isLoading = false;
		}
	}

	private subscribeToMessages(): void {
		this.subscriptions.push(
			this.SignalrService.messageReceived$
				.subscribe((message: ChatMessage | null) => {
					if (message && message.conversationId === this.conversationId) {
						this.messages.push(message);
						this.markMessageAsRead(message.id);
					}
				})
		);
	}

	private subscribeToTypingIndicators(): void {
		this.subscriptions.push(
			this.SignalrService.typingIndicator$
				.subscribe((indicator: TypingIndicator | null) => {
					if (indicator && indicator.conversationId === this.conversationId) {
						if (indicator.isTyping) {
							if (!this.typingUsers.includes(indicator.userName)) {
								this.typingUsers.push(indicator.userName);
							}
						} else {
							this.typingUsers = this.typingUsers.filter(user => user !== indicator.userName);
						}
					}
				})
		);
	}

	// ... rest of the methods remain the same
	public trackByMessageId(index: number, message: ChatMessage): string {
		return message.id;
	}

	public isMyMessage(message: ChatMessage): boolean {
		return message.senderId === 1;
	}

	public formatMessageTime(timestamp: Date | string): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	public openImageViewer(imageUrl: string): void {
		window.open(imageUrl, '_blank');
	}

	public downloadAttachment(message: ChatMessage): void {
		console.log('Downloading attachment for message:', message.id);
	}

	public getFileIcon(messageType: string): string {
		switch (messageType) {
			case 'image': return 'image';
			case 'file': return 'attach_file';
			default: return 'description';
		}
	}

	public onDragOver(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver = true;
	}

	public onDragLeave(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver = false;
	}

	public onDrop(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files) {
			this.handleFiles(Array.from(files));
		}
	}

	public openFileDialog(): void {
		this.fileInput.nativeElement.click();
	}

	public onFileSelected(event: any): void {
		const files = event.target.files;
		if (files) {
			this.handleFiles(Array.from(files));
		}
	}

	private handleFiles(files: File[]): void {
		files.forEach(file => {
			if (this.isFileTypeAllowed(file)) {
				const filePreview: FilePreview = {
					file: file,
					type: file.type.startsWith('image/') ? 'image' : 'file'
				};

				if (filePreview.type === 'image') {
					const reader = new FileReader();
					reader.onload = (e) => {
						filePreview.preview = e.target?.result as string;
					};
					reader.readAsDataURL(file);
				}

				this.selectedFiles.push(filePreview);
			}
		});
	}

	private isFileTypeAllowed(file: File): boolean {
		const extension = '.' + file.name.split('.').pop()?.toLowerCase();
		return this.allowedFileTypes.includes(extension || '');
	}

	public removeFile(index: number): void {
		this.selectedFiles.splice(index, 1);
	}

	public onTyping(): void {
		if (this.otherParticipant) {
			this.sendTypingIndicator(true);

			if (this.typingTimeout) {
				clearTimeout(this.typingTimeout);
			}

			this.typingTimeout = setTimeout(() => {
				this.sendTypingIndicator(false);
			}, 3000);
		}
	}

	public onKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			this.sendMessage();
		}
	}

	public async sendMessage(): Promise<void> {
		if (this.newMessage.trim() || this.selectedFiles.length > 0) {
			const messageContent = this.newMessage.trim();

			if (messageContent && this.otherParticipant) {
				const message: ChatMessage = {
					id: `msg_${Date.now()}`,
					senderId: 1,
					receiverId: this.otherParticipant.userId,
					message: messageContent,
					timestamp: new Date(),
					isRead: false,
					messageType: this.selectedFiles.length > 0 ? 'file' : 'text',
					conversationId: this.conversationId,
					senderName: 'Admin User',
					receiverName: this.otherParticipant.userName
				};

				try {
					await this.SignalrService.sendMessage(message);
					this.messages.push(message);
					this.newMessage = '';
					this.selectedFiles = [];
					this.sendTypingIndicator(false);
				} catch (error) {
					console.error('Failed to send message:', error);
				}
			}
		}
	}

	public async sendTypingIndicator(isTyping: boolean): Promise<void> {
		if (this.otherParticipant) {
			try {
				await this.SignalrService.sendTypingIndicator(
					this.otherParticipant.userId,
					isTyping,
					this.conversationId
				);
			} catch (error) {
				console.error('Failed to send typing indicator:', error);
			}
		}
	}

	public async markMessageAsRead(messageId: string): Promise<void> {
		try {
			await this.SignalrService.markMessageAsRead(messageId);
		} catch (error) {
			console.error('Failed to mark message as read:', error);
		}
	}
}
