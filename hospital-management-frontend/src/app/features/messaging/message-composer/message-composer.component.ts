import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from '../../../core/services/message.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Message } from '../../../core/models';

interface MedicalTemplate {
	id: string;
	name: string;
	content: string;
	category: 'consultation' | 'prescription' | 'lab_result' | 'appointment' | 'emergency';
}

@Component({
	selector: 'app-message-composer',
	standalone: false,
	templateUrl: './message-composer.component.html',
	styleUrls: ['./message-composer.component.scss']
})
export class MessageComposerComponent implements OnInit, OnDestroy {
	@Input() recipientId?: number;
	@Input() recipientName?: string;
	@Input() conversationId?: string;
	@Output() messageSent = new EventEmitter<Message>();
	@Output() cancel = new EventEmitter<void>();

	private destroy$ = new Subject<void>();

	isDarkMode = false;
	isLoading = false;
	isSending = false;
	currentUser: any;

	// Form and Editor
	messageForm: FormGroup;
	editorContent = '';
	selectedFiles: File[] = [];

	// Rich Text Editor Configuration
	quillConfig = {
		toolbar: {
			container: [
				['bold', 'italic', 'underline', 'strike'],
				['blockquote', 'code-block'],
				[{ 'header': 1 }, { 'header': 2 }],
				[{ 'list': 'ordered' }, { 'list': 'bullet' }],
				[{ 'script': 'sub' }, { 'script': 'super' }],
				[{ 'indent': '-1' }, { 'indent': '+1' }],
				[{ 'direction': 'rtl' }],
				[{ 'size': ['small', false, 'large', 'huge'] }],
				[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
				[{ 'color': [] }, { 'background': [] }],
				[{ 'font': [] }],
				[{ 'align': [] }],
				['clean'],
				['link', 'image', 'video'],
				['emoji']
			]
		},
		placeholder: 'Compose your secure medical message...',
		theme: 'snow',
		modules: {
			syntax: true,
			toolbar: true
		}
	};

	// Medical Templates
	medicalTemplates: MedicalTemplate[] = [
		{
			id: 'consultation-followup',
			name: 'Consultation Follow-up',
			category: 'consultation',
			content: `<p><strong>Follow-up Consultation</strong></p>
                <p>Dear Patient,</p>
                <p>Following our recent consultation, I wanted to provide you with additional information and next steps:</p>
                <ul>
                  <li>Current condition assessment:</li>
                  <li>Recommended treatment plan:</li>
                  <li>Next appointment scheduling:</li>
                </ul>
                <p>Please don't hesitate to contact me if you have any questions.</p>
                <p>Best regards,<br>Dr. [Your Name]</p>`
		},
		{
			id: 'prescription-instructions',
			name: 'Prescription Instructions',
			category: 'prescription',
			content: `<p><strong>Prescription Instructions</strong></p>
                <p>Dear Patient,</p>
                <p>Please find below your prescription details and instructions:</p>
                <p><strong>Medication:</strong> [Medication Name]</p>
                <p><strong>Dosage:</strong> [Dosage Information]</p>
                <p><strong>Frequency:</strong> [How often to take]</p>
                <p><strong>Duration:</strong> [Treatment duration]</p>
                <p><strong>Special Instructions:</strong></p>
                <ul>
                  <li>Take with/without food</li>
                  <li>Avoid alcohol/specific activities</li>
                  <li>Monitor for side effects</li>
                </ul>
                <p>Please contact me immediately if you experience any adverse reactions.</p>`
		},
		{
			id: 'lab-results',
			name: 'Lab Results Notification',
			category: 'lab_result',
			content: `<p><strong>Laboratory Results Available</strong></p>
                <p>Dear Patient,</p>
                <p>Your recent laboratory test results are now available for review:</p>
                <p><strong>Test Date:</strong> [Date]</p>
                <p><strong>Tests Performed:</strong></p>
                <ul>
                  <li>[Test Name 1] - [Result] [Reference Range]</li>
                  <li>[Test Name 2] - [Result] [Reference Range]</li>
                </ul>
                <p><strong>Summary:</strong> [Overall assessment]</p>
                <p>Please schedule a follow-up appointment to discuss these results in detail.</p>`
		},
		{
			id: 'appointment-reminder',
			name: 'Appointment Reminder',
			category: 'appointment',
			content: `<p><strong>Appointment Reminder</strong></p>
                <p>Dear Patient,</p>
                <p>This is a reminder of your upcoming appointment:</p>
                <p><strong>Date:</strong> [Appointment Date]</p>
                <p><strong>Time:</strong> [Appointment Time]</p>
                <p><strong>Location:</strong> [Clinic/Hospital Address]</p>
                <p><strong>Purpose:</strong> [Reason for visit]</p>
                <p><strong>Preparation Instructions:</strong></p>
                <ul>
                  <li>Bring your insurance card and ID</li>
                  <li>List of current medications</li>
                  <li>Any relevant medical records</li>
                </ul>
                <p>Please arrive 15 minutes early for check-in.</p>`
		},
		{
			id: 'emergency-instructions',
			name: 'Emergency Instructions',
			category: 'emergency',
			content: `<p><strong style="color: #f44336;">URGENT MEDICAL INSTRUCTIONS</strong></p>
                <p>Dear Patient,</p>
                <p><strong>This message contains important medical instructions that require immediate attention.</strong></p>
                <p><strong>Immediate Actions Required:</strong></p>
                <ol>
                  <li>[First action to take]</li>
                  <li>[Second action to take]</li>
                  <li>[Third action to take]</li>
                </ol>
                <p><strong style="color: #f44336;">If you experience any of the following symptoms, seek emergency care immediately:</strong></p>
                <ul>
                  <li>[Symptom 1]</li>
                  <li>[Symptom 2]</li>
                  <li>[Symptom 3]</li>
                </ul>
                <p><strong>Emergency Contact:</strong> [Emergency Number]</p>`
		}
	];

	// Template Categories
	templateCategories = [
		{ value: 'consultation', label: 'Consultation', icon: 'medical_services', color: '#4299ed' },
		{ value: 'prescription', label: 'Prescription', icon: 'medication', color: '#4caf50' },
		{ value: 'lab_result', label: 'Lab Results', icon: 'science', color: '#9c27b0' },
		{ value: 'appointment', label: 'Appointment', icon: 'event', color: '#ff9800' },
		{ value: 'emergency', label: 'Emergency', icon: 'emergency', color: '#f44336' }
	];

	constructor(
		private fb: FormBuilder,
		private messageService: MessageService,
		private themeService: ThemeService,
		private authService: AuthService,
		private snackBar: MatSnackBar
	) {
		this.messageForm = this.fb.group({
			subject: ['', [Validators.required, Validators.maxLength(200)]],
			content: ['', [Validators.required, Validators.minLength(10)]],
			priority: ['medium', Validators.required],
			isUrgent: [false]
		});
	}

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.subscribeToTheme();
		this.setupFormValidation();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
				this.updateQuillTheme();
			});
	}

	private updateQuillTheme(): void {
		this.quillConfig = {
			...this.quillConfig,
			theme: this.isDarkMode ? 'bubble' : 'snow'
		};
	}

	private setupFormValidation(): void {
		this.messageForm.get('content')?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(content => {
				this.editorContent = content;
			});
	}

	// Template Methods
	applyTemplate(template: MedicalTemplate): void {
		this.editorContent = template.content;
		this.messageForm.patchValue({
			content: template.content,
			subject: template.name
		});

		this.showSuccessMessage(`Applied template: ${template.name}`);
	}

	getTemplatesByCategory(category: string): MedicalTemplate[] {
		return this.medicalTemplates.filter(template => template.category === category);
	}

	// File Handling
	onFileSelected(event: any): void {
		const files = Array.from(event.target.files) as File[];
		this.addFiles(files);
	}

	onDragOver(event: DragEvent): void {
		event.preventDefault();
	}

	onDrop(event: DragEvent): void {
		event.preventDefault();
		const files = Array.from(event.dataTransfer?.files || []);
		this.addFiles(files);
	}

	private addFiles(files: File[]): void {
		const maxFileSize = 10 * 1024 * 1024; // 10MB
		const allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'];

		files.forEach(file => {
			if (file.size > maxFileSize) {
				this.showErrorMessage(`File ${file.name} is too large. Maximum size is 10MB.`);
				return;
			}

			this.selectedFiles.push(file);
		});
	}

	removeFile(index: number): void {
		this.selectedFiles.splice(index, 1);
	}

	// Message Sending
	async sendMessage(): Promise<void> {
		if (this.messageForm.invalid || this.isSending) {
			return;
		}

		if (!this.recipientId) {
			this.showErrorMessage('Please select a recipient');
			return;
		}

		this.isSending = true;
		const formValue = this.messageForm.value;

		try {
			// Upload attachments first if any
			const attachmentPromises = this.selectedFiles.map(file =>
				this.messageService.uploadAttachment(file).toPromise()
			);

			const attachments = await Promise.all(attachmentPromises);

			// Create message
			const message: Partial<Message> = {
				senderId: this.currentUser?.id,
				receiverId: this.recipientId,
				subject: formValue.subject,
				messageContent: formValue.content,
				isRead: false,
				sentDate: new Date(),
				senderName: `${this.currentUser?.firstName} ${this.currentUser?.lastName}`,
				receiverName: this.recipientName,
				messageType: 'text'
			};

			// Send message
			this.messageService.sendMessage(
				formValue
			).pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (sentMessage: Message) => {
						this.messageSent.emit(sentMessage);
						this.resetForm();
						this.showSuccessMessage('Message sent successfully');
						this.isSending = false;
					},
					error: (error: any) => {
						console.error('Error sending message:', error);
						this.showErrorMessage('Failed to send message');
						this.isSending = false;
					}
				});

		} catch (error) {
			console.error('Error preparing message:', error);
			this.showErrorMessage('Failed to prepare message');
			this.isSending = false;
		}
	}

	saveDraft(): void {
		const draftData = {
			...this.messageForm.value,
			content: this.editorContent,
			recipientId: this.recipientId,
			files: this.selectedFiles.map(f => f.name)
		};

		localStorage.setItem('message_draft', JSON.stringify(draftData));
		this.showSuccessMessage('Draft saved');
	}

	loadDraft(): void {
		const draftData = localStorage.getItem('message_draft');
		if (draftData) {
			const draft = JSON.parse(draftData);
			this.messageForm.patchValue(draft);
			this.editorContent = draft.content;
			this.showSuccessMessage('Draft loaded');
		}
	}

	private resetForm(): void {
		this.messageForm.reset({
			priority: 'medium',
			isUrgent: false
		});
		this.editorContent = '';
		this.selectedFiles = [];
		localStorage.removeItem('message_draft');
	}

	onCancel(): void {
		this.resetForm();
		this.cancel.emit();
	}

	// Editor Events
	onEditorCreated(quill: any): void {
		console.log('Quill editor created:', quill);
	}

	onContentChanged(event: any): void {
		this.messageForm.patchValue({
			content: event.html
		});
	}

	// Utility Methods
	getFileIcon(fileName: string): string {
		const extension = fileName.split('.').pop()?.toLowerCase();
		switch (extension) {
			case 'pdf': return 'picture_as_pdf';
			case 'doc':
			case 'docx': return 'description';
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'gif': return 'image';
			default: return 'attach_file';
		}
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	private showSuccessMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 3000,
			panelClass: ['success-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}

	private showErrorMessage(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 5000,
			panelClass: ['error-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}
}
