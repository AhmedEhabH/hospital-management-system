import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subject, takeUntil, interval } from 'rxjs';
import { MessageService, Message, Conversation } from '../../../core/services/message.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-chat-window',
	standalone: false,
	templateUrl: './chat-window.component.html',
	styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
	@Input() conversation: Conversation | null = null;
	@ViewChild('messagesContainer') messagesContainer!: ElementRef;
	@ViewChild('fileInput') fileInput!: ElementRef;

	private destroy$ = new Subject<void>();
	private shouldScrollToBottom = false;

	isDarkMode = false;
	isLoading = false;
	currentUser: any;

	// Messages
	messages: Message[] = [];
	newMessage = '';
	isTyping = false;
	typingUsers: string[] = [];

	// File handling
	selectedFiles: File[] = [];
	isDragOver = false;
	maxFileSize = 10 * 1024 * 1024; // 10MB
	allowedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'];

	constructor(
		private messageService: MessageService,
		public signalRService: SignalRService,
		private themeService: ThemeService,
		private authService: AuthService,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.subscribeToTheme();
		this.subscribeToSignalREvents();

		if (this.conversation) {
			this.loadMessages();
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngAfterViewChecked(): void {
		if (this.shouldScrollToBottom) {
			this.scrollToBottom();
			this.shouldScrollToBottom = false;
		}
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	private subscribeToSignalREvents(): void {
		// Subscribe to incoming messages
		this.signalRService.messageReceived$
			.pipe(takeUntil(this.destroy$))
			.subscribe(message => {
				if (message.conversationId === this.conversation?.id) {
					this.addMessage({
						id: parseInt(message.id),
						senderId: message.senderId,
						receiverId: message.receiverId,
						subject: 'Chat Message',
						messageContent: message.message,
						isRead: false,
						sentDate: message.timestamp,
						senderName: message.senderName || 'Unknown',
						receiverName: message.receiverName,
						messageType: message.messageType as any,
						conversationId: message.conversationId
					});
				}
			});

		// Subscribe to typing indicators
		this.signalRService.typingIndicator$
			.pipe(takeUntil(this.destroy$))
			.subscribe(indicator => {
				if (indicator.isTyping) {
					if (!this.typingUsers.includes(indicator.userName)) {
						this.typingUsers.push(indicator.userName);
					}
				} else {
					this.typingUsers = this.typingUsers.filter(user => user !== indicator.userName);
				}
			});
	}

	private loadMessages(): void {
		if (!this.conversation) return;

		this.isLoading = true;
		this.messageService.getMessages(this.conversation.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (messages: Message[]) => {
					this.messages = messages;
					this.shouldScrollToBottom = true;
					this.markAllMessagesAsRead();
					this.isLoading = false;
				},
				error: (error: any) => {
					console.error('Error loading messages:', error);
					this.isLoading = false;
					this.showErrorMessage('Failed to load messages');
				}
			});
	}

	// Message handling
	async sendMessage(): Promise<void> {
		if (!this.newMessage.trim() && this.selectedFiles.length === 0) {
			return;
		}

		if (!this.conversation || !this.signalRService.isConnected()) {
			this.showErrorMessage('Unable to send message. Please check your connection.');
			return;
		}

		const messageText = this.newMessage.trim();
		const files = [...this.selectedFiles];

		this.newMessage = '';
		this.selectedFiles = [];
		this.stopTyping();

		try {
			// Send text message if present
			if (messageText) {
				await this.sendTextMessage(messageText);
			}

			// Send file attachments
			for (const file of files) {
				await this.sendFileMessage(file);
			}

		} catch (error) {
			console.error('Error sending message:', error);
			this.showErrorMessage('Failed to send message');
		}
	}

	private async sendTextMessage(messageText: string): Promise<void> {
		if (!this.conversation) return;

		const tempMessage: Message = {
			id: Date.now(),
			senderId: this.currentUser?.id || 0,
			receiverId: this.getOtherParticipant()?.userId || 0,
			subject: 'Chat Message',
			messageContent: messageText,
			isRead: false,
			sentDate: new Date(),
			senderName: this.currentUser?.firstName + ' ' + this.currentUser?.lastName,
			messageType: 'text',
			conversationId: this.conversation.id
		};

		this.addMessage(tempMessage);

		// Send via API and SignalR
		this.messageService.sendMessage(this.conversation.id, messageText, 'text')
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (sentMessage: Message) => {
					this.updateMessage(tempMessage.id, sentMessage);

					// Send via SignalR for real-time delivery
					this.signalRService.sendMessage({
						senderId: sentMessage.senderId,
						senderName: sentMessage.senderName || '',
						receiverId: sentMessage.receiverId,
						receiverName: sentMessage.receiverName || '',
						message: sentMessage.messageContent,
						conversationId: sentMessage.conversationId || '',
						messageType: sentMessage.messageType as any,
						isRead: sentMessage.isRead
					});
				},
				error: (error: any) => {
					this.removeMessage(tempMessage.id);
					this.showErrorMessage('Failed to send message');
				}
			});
	}

	private async sendFileMessage(file: File): Promise<void> {
		if (!this.conversation) return;

		// Upload file first
		this.messageService.uploadAttachment(file)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (attachment) => {
					const fileMessage: Message = {
						id: Date.now(),
						senderId: this.currentUser?.id || 0,
						receiverId: this.getOtherParticipant()?.userId || 0,
						subject: 'File Attachment',
						messageContent: `File: ${attachment.fileName}`,
						isRead: false,
						sentDate: new Date(),
						senderName: this.currentUser?.firstName + ' ' + this.currentUser?.lastName,
						messageType: file.type.startsWith('image/') ? 'image' : 'file',
						conversationId: this.conversation!.id,
						attachmentUrl: attachment.url,
						attachmentName: attachment.fileName
					};

					this.addMessage(fileMessage);

					// Send file message via SignalR
					this.signalRService.sendMessage({
						senderId: fileMessage.senderId,
						senderName: fileMessage.senderName || '',
						receiverId: fileMessage.receiverId,
						receiverName: fileMessage.receiverName || '',
						message: fileMessage.messageContent,
						conversationId: fileMessage.conversationId || '',
						messageType: fileMessage.messageType as any,
						isRead: fileMessage.isRead
					});
				},
				error: (error) => {
					this.showErrorMessage(`Failed to upload ${file.name}`);
				}
			});
	}

	// Typing indicators
	onTyping(): void {
		if (!this.isTyping && this.conversation) {
			this.isTyping = true;
			const otherParticipant = this.getOtherParticipant();
			if (otherParticipant) {
				this.signalRService.sendTypingIndicator(otherParticipant.userId, true);
			}

			// Stop typing after 3 seconds of inactivity
			setTimeout(() => {
				if (this.isTyping) {
					this.stopTyping();
				}
			}, 3000);
		}
	}

	private stopTyping(): void {
		if (this.isTyping && this.conversation) {
			this.isTyping = false;
			const otherParticipant = this.getOtherParticipant();
			if (otherParticipant) {
				this.signalRService.sendTypingIndicator(otherParticipant.userId, false);
			}
		}
	}

	// File handling
	onFileSelected(event: any): void {
		const files = Array.from(event.target.files) as File[];
		this.addFiles(files);
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver = true;
	}

	onDragLeave(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver = false;
	}

	onDrop(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver = false;

		const files = Array.from(event.dataTransfer?.files || []);
		this.addFiles(files);
	}

	private addFiles(files: File[]): void {
		for (const file of files) {
			if (this.validateFile(file)) {
				this.selectedFiles.push(file);
			}
		}
	}

	private validateFile(file: File): boolean {
		if (file.size > this.maxFileSize) {
			this.showErrorMessage(`File ${file.name} is too large. Maximum size is 10MB.`);
			return false;
		}

		return true;
	}

	removeFile(index: number): void {
		this.selectedFiles.splice(index, 1);
	}

	openFileDialog(): void {
		this.fileInput.nativeElement.click();
	}

	// Message utilities
	private addMessage(message: Message): void {
		this.messages.push(message);
		this.shouldScrollToBottom = true;
		this.messageService.updateConversationLastMessage(this.conversation!.id, message);
	}

	private updateMessage(tempId: number, newMessage: Message): void {
		const index = this.messages.findIndex(m => m.id === tempId);
		if (index >= 0) {
			this.messages[index] = newMessage;
		}
	}

	private removeMessage(messageId: number): void {
		this.messages = this.messages.filter(m => m.id !== messageId);
	}

	private markAllMessagesAsRead(): void {
		const unreadMessages = this.messages.filter(m =>
			!m.isRead && m.receiverId === this.currentUser?.id
		);

		unreadMessages.forEach(message => {
			this.messageService.markAsRead(message.id).subscribe();
			this.signalRService.markMessageAsRead(message.id.toString());
		});
	}

	private scrollToBottom(): void {
		if (this.messagesContainer) {
			const element = this.messagesContainer.nativeElement;
			element.scrollTop = element.scrollHeight;
		}
	}

	// Utility methods
	isMyMessage(message: Message): boolean {
		return message.senderId === this.currentUser?.id;
	}

	private getOtherParticipant(): any {
		if (!this.conversation) return null;
		return this.conversation.participants.find(p => p.userId !== this.currentUser?.id);
	}

	formatMessageTime(timestamp: Date): string {
		const now = new Date();
		const messageTime = new Date(timestamp);
		const diffInHours = Math.abs(now.getTime() - messageTime.getTime()) / 36e5;

		if (diffInHours < 1) {
			return 'Just now';
		} else if (diffInHours < 24) {
			return messageTime.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit'
			});
		} else {
			return messageTime.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}
	}

	getFileIcon(messageType: string): string {
		switch (messageType) {
			case 'image': return 'image';
			case 'file': return 'attach_file';
			default: return 'description';
		}
	}

	downloadAttachment(message: Message): void {
		if (message.attachmentUrl) {
			const link = document.createElement('a');
			link.href = message.attachmentUrl;
			link.download = message.attachmentName || 'download';
			link.click();
		}
	}

	private showErrorMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 5000,
			panelClass: ['error-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}

	// Keyboard shortcuts
	onKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			this.sendMessage();
		}
	}

	// FIXED: Add missing openImageViewer method
	openImageViewer(imageUrl: string | undefined): void {
		if (!imageUrl) return;

		// Create a modal or new window to display the image
		const imageWindow = window.open('', '_blank');
		if (imageWindow) {
			imageWindow.document.write(`
      <html>
        <head>
          <title>Image Viewer</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              background: #000; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
            }
            img { 
              max-width: 100%; 
              max-height: 100%; 
              object-fit: contain; 
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(255,255,255,0.1);
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="Medical Image" />
        </body>
      </html>
    `);
			imageWindow.document.close();
		}
	}

	// ENHANCED: Add trackBy method for performance optimization
	trackByMessageId(index: number, message: Message): number {
		return message.id;
	}

	// ENHANCED: Add method to check if SignalR is connected
	

	// ENHANCED: Add method to format file size
	formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	// ENHANCED: Add method to get file type icon
	getFileTypeIcon(fileName: string): string {
		const extension = fileName.split('.').pop()?.toLowerCase();

		switch (extension) {
			case 'pdf':
				return 'picture_as_pdf';
			case 'doc':
			case 'docx':
				return 'description';
			case 'xls':
			case 'xlsx':
				return 'table_chart';
			case 'ppt':
			case 'pptx':
				return 'slideshow';
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'gif':
			case 'bmp':
				return 'image';
			case 'mp4':
			case 'avi':
			case 'mov':
				return 'video_file';
			case 'mp3':
			case 'wav':
			case 'ogg':
				return 'audio_file';
			case 'zip':
			case 'rar':
			case '7z':
				return 'archive';
			default:
				return 'attach_file';
		}
	}

	// ENHANCED: Add method to validate message before sending
	private validateMessage(): boolean {
		if (!this.newMessage.trim() && this.selectedFiles.length === 0) {
			this.showErrorMessage('Please enter a message or select files to send.');
			return false;
		}

		if (!this.conversation) {
			this.showErrorMessage('No active conversation selected.');
			return false;
		}

		if (!this.signalRService.isConnected()) {
			this.showErrorMessage('Connection lost. Please check your internet connection.');
			return false;
		}

		return true;
	}

	// ENHANCED: Add method to handle message retry
	retryMessage(message: Message): void {
		if (message.messageType === 'text') {
			this.sendTextMessage(message.messageContent);
		}
	}

	// ENHANCED: Add method to copy message text
	copyMessageText(message: Message): void {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(message.messageContent).then(() => {
				this.snackBar.open('Message copied to clipboard', 'Close', {
					duration: 2000,
					panelClass: ['success-snackbar']
				});
			}).catch(() => {
				this.fallbackCopyTextToClipboard(message.messageContent);
			});
		} else {
			this.fallbackCopyTextToClipboard(message.messageContent);
		}
	}

	private fallbackCopyTextToClipboard(text: string): void {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			document.execCommand('copy');
			this.snackBar.open('Message copied to clipboard', 'Close', {
				duration: 2000,
				panelClass: ['success-snackbar']
			});
		} catch (err) {
			this.showErrorMessage('Failed to copy message');
		}

		document.body.removeChild(textArea);
	}

}
