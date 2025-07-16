import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemeService } from '../../../core/services/theme.service';
import { Subject, takeUntil } from 'rxjs';
import { CurrentUserDto, MessageDto, MessageTemplate, RecipientDto } from '../../../core/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
	selector: 'app-compose-message',
	standalone: false,
	templateUrl: './compose-message.component.html',
	styleUrl: './compose-message.component.scss'
})
export class ComposeMessageComponent implements OnInit, OnDestroy {
	isDarkMode = false;
	isLoading = false;

	messageForm: FormGroup;
	currentUser: CurrentUserDto | null = null;
	recipients: RecipientDto[] = [];

	messageTemplates: MessageTemplate[] = [
		{ name: 'Appointment Reminder', template: 'This is a reminder for your upcoming appointment on [DATE] at [TIME].' },
		{ name: 'Lab Results', template: 'Your lab results are ready. Please review them in your patient portal.' },
		{ name: 'Prescription Renewal', template: 'Your prescription for [MEDICATION] is due for renewal.' },
		{ name: 'Follow-up Required', template: 'Please schedule a follow-up appointment to discuss your recent visit.' },
		{ name: 'Test Results Normal', template: 'Your recent test results are within normal ranges. No further action required.' },
		{ name: 'Emergency Contact', template: 'Please contact our emergency department immediately regarding [URGENT_MATTER].' }
	];

	private destroy$ = new Subject<void>();

	constructor(
		private themeService: ThemeService,
		private fb: FormBuilder,
		private messageService: MessageService,
		private authService: AuthService,
		private router: Router,
		private snackBar: MatSnackBar
	) {
		this.messageForm = this.createForm();
	}
	ngOnInit(): void {
		this.subscribeToTheme();
		this.initializeUser();
		this.loadRecipients();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private createForm(): FormGroup {
		return this.fb.group({
			receiverId: ['', [Validators.required]],
			subject: ['', [Validators.required, Validators.maxLength(200)]],
			message: ['', [Validators.required, Validators.maxLength(1000)]],
			messageType: ['General', [Validators.required]],
			priority: ['Medium', [Validators.required]]
		});
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}


	private initializeUser(): void {
		this.currentUser = this.authService.getCurrentUser();
	}

	private loadRecipients(): void {
		if (!this.currentUser) return;

		// Load recipients based on user type
		if (this.currentUser.userType === 'Doctor') {
			this.recipients = [
				{ id: 1, name: 'John Doe', type: 'Patient', email: 'john.doe@email.com' },
				{ id: 2, name: 'Jane Smith', type: 'Patient', email: 'jane.smith@email.com' },
				{ id: 3, name: 'Admin User', type: 'Admin', email: 'admin@hospital.com' }
			];
		} else if (this.currentUser.userType === 'Patient') {
			this.recipients = [
				{ id: 3, name: 'Dr. Sarah Johnson', type: 'Doctor', email: 'sarah.johnson@hospital.com' },
				{ id: 4, name: 'Dr. Mike Wilson', type: 'Doctor', email: 'mike.wilson@hospital.com' },
				{ id: 5, name: 'Admin Support', type: 'Admin', email: 'support@hospital.com' }
			];
		} else if (this.currentUser.userType === 'Admin') {
			this.recipients = [
				{ id: 1, name: 'John Doe', type: 'Patient', email: 'john.doe@email.com' },
				{ id: 2, name: 'Jane Smith', type: 'Patient', email: 'jane.smith@email.com' },
				{ id: 3, name: 'Dr. Sarah Johnson', type: 'Doctor', email: 'sarah.johnson@hospital.com' },
				{ id: 4, name: 'Dr. Mike Wilson', type: 'Doctor', email: 'mike.wilson@hospital.com' }
			];
		}
	}

	public applyTemplate(template: MessageTemplate): void {
		this.messageForm.patchValue({
			message: template.template,
			subject: template.name
		});
	}

	public onSubmit(): void {
		if (this.messageForm.valid && this.currentUser) {
			this.isLoading = true;

			const messageData: MessageDto = {
				id: 0,
				senderId: this.currentUser.id,
				receiverId: this.messageForm.value.receiverId,
				subject: this.messageForm.value.subject,
				messageContent: this.messageForm.value.message,
				isRead: false,
				sentDate: new Date().toISOString()
			};

			this.messageService.sendMessage(messageData).subscribe({
				next: (result) => {
					this.snackBar.open('Message sent successfully!', 'Close', {
						duration: 3000,
						panelClass: ['success-snackbar']
					});

					this.router.navigate(['/messaging']);
				},
				error: (error) => {
					console.error('Error sending message:', error);
					this.snackBar.open('Error sending message. Please try again.', 'Close', {
						duration: 3000,
						panelClass: ['error-snackbar']
					});
				},
				complete: () => {
					this.isLoading = false;
				}
			});
		} else {
			this.markFormGroupTouched(this.messageForm);
		}
	}

	public onCancel(): void {
		this.router.navigate(['/messaging']);
	}

	public getErrorMessage(fieldName: string): string {
		const control = this.messageForm.get(fieldName);
		if (control?.hasError('required')) {
			return `${this.getFieldDisplayName(fieldName)} is required`;
		}
		if (control?.hasError('maxlength')) {
			const maxLength = control.errors?.['maxlength']?.requiredLength;
			return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
		}
		return '';
	}

	public hasError(fieldName: string): boolean {
		const control = this.messageForm.get(fieldName);
		return !!(control?.invalid && (control?.dirty || control?.touched));
	}

	public getControlValue(fieldName: string): any {
		return this.messageForm.get(fieldName)?.value;
	}

	private getFieldDisplayName(fieldName: string): string {
		const fieldNames: { [key: string]: string } = {
			'receiverId': 'Recipient',
			'subject': 'Subject',
			'message': 'Message',
			'messageType': 'Message Type',
			'priority': 'Priority'
		};
		return fieldNames[fieldName] || fieldName;
	}

	private markFormGroupTouched(formGroup: FormGroup): void {
		Object.keys(formGroup.controls).forEach(key => {
			const control = formGroup.get(key);
			control?.markAsTouched();
		});
	}
}
