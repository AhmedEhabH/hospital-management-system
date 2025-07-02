import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FeedbackService } from '../../../core/services/feedback.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-feedback-form',
	standalone: false,
	templateUrl: './feedback-form.component.html',
	styleUrls: ['./feedback-form.component.scss']
})
export class FeedbackFormComponent implements OnInit {
	feedbackForm: FormGroup;
	isLoading = false;
	currentUser: any = null;

	constructor(
		private fb: FormBuilder,
		private feedbackService: FeedbackService,
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private router: Router
	) {
		this.feedbackForm = this.createForm();
	}

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		if (this.currentUser) {
			this.feedbackForm.patchValue({
				userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
				emailId: this.currentUser.email
			});
		}
	}

	private createForm(): FormGroup {
		return this.fb.group({
			userName: ['', [Validators.required, Validators.maxLength(100)]],
			emailId: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
			comments: ['', [Validators.required, Validators.maxLength(2000)]]
		});
	}

	public onSubmit(): void {
		if (this.feedbackForm.valid) {
			this.isLoading = true;

			const feedbackData = {
				...this.feedbackForm.value,
				userId: this.currentUser?.id || 0
			};

			this.feedbackService.createFeedback(feedbackData).subscribe({
				next: (result) => {
					console.log('Feedback submitted successfully!', result);
					this.snackBar.open('Feedback submitted successfully!', 'Close', {
						duration: 3000,
						panelClass: ['success-snackbar']
					});
					this.feedbackForm.reset();
				},
				error: (error) => {
					console.error('Error submitting feedback:', error);
					this.snackBar.open('Error submitting feedback', 'Close', {
						duration: 3000,
						panelClass: ['error-snackbar']
					});
				},
				complete: () => {
					this.isLoading = false;
				}
			});
		}
	}

	public getErrorMessage(fieldName: string): string {
		const control = this.feedbackForm.get(fieldName);
		if (control?.hasError('required')) {
			return `${fieldName} is required`;
		}
		if (control?.hasError('email')) {
			return 'Please enter a valid email address';
		}
		if (control?.hasError('maxlength')) {
			return `${fieldName} is too long`;
		}
		return '';
	}

	public hasError(fieldName: string): boolean {
		const control = this.feedbackForm.get(fieldName);
		return !!(control?.invalid && control?.touched);
	}
}
