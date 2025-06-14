import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
	selector: 'app-register',
	standalone:false,
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
	registerForm!: FormGroup;
	isLoading = false;
	hidePassword = true;
	hideConfirmPassword = true;
	isDarkMode = false;
	private destroy$ = new Subject<void>();

	userTypes = [
		{
			value: 'Patient',
			label: 'Patient',
			description: 'Health Records & Appointments'
		},
		{
			value: 'Doctor',
			label: 'Medical Doctor',
			description: 'Patient Care & Medical Records'
		}
	];

	genderOptions = [
		{ value: 'Male', label: 'Male' },
		{ value: 'Female', label: 'Female' },
		{ value: 'Other', label: 'Other' }
	];

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private themeService: ThemeService,
		private router: Router,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.initializeForm();
		this.subscribeToTheme();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private initializeForm(): void {
		this.registerForm = this.fb.group({
			firstName: ['', [Validators.required, Validators.minLength(2)]],
			lastName: ['', [Validators.required, Validators.minLength(2)]],
			gender: ['', Validators.required],
			age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
			userId: ['', [Validators.required, Validators.minLength(3)]],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required],
			address: ['', Validators.required],
			city: ['', Validators.required],
			state: ['', Validators.required],
			zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
			phoneNo: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
			userType: ['Patient', Validators.required]
		}, { validators: this.passwordMatchValidator });
	}

	private passwordMatchValidator(form: FormGroup) {
		const password = form.get('password');
		const confirmPassword = form.get('confirmPassword');

		if (password && confirmPassword && password.value !== confirmPassword.value) {
			confirmPassword.setErrors({ passwordMismatch: true });
		} else if (confirmPassword?.errors?.['passwordMismatch']) {
			delete confirmPassword.errors['passwordMismatch'];
			if (Object.keys(confirmPassword.errors).length === 0) {
				confirmPassword.setErrors(null);
			}
		}
		return null;
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	onSubmit(): void {
		if (this.registerForm.valid && !this.isLoading) {
			this.isLoading = true;
			const userData = { ...this.registerForm.value };
			delete userData.confirmPassword;

			this.authService.register(userData)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (result: any) => {
						this.isLoading = false;
						if (result.success) {
							this.showSuccess('Registration successful! Please login.');
							this.router.navigate(['/auth/login']);
						} else {
							this.showError(result.message);
						}
					},
					error: (error: any) => {
						this.isLoading = false;
						this.showError('Registration failed. Please try again.');
						console.error('Registration error:', error);
					}
				});
		}
	}

	toggleTheme(): void {
		this.themeService.toggleTheme();
	}

	private showSuccess(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 3000,
			panelClass: ['success-snackbar']
		});
	}

	private showError(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 5000,
			panelClass: ['error-snackbar']
		});
	}

	getFieldError(fieldName: string): string {
		const field = this.registerForm.get(fieldName);
		if (field?.errors && field.touched) {
			if (field.errors['required']) return `${fieldName} is required`;
			if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
			if (field.errors['email']) return 'Please enter a valid email';
			if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
			if (field.errors['max']) return `${fieldName} must be at most ${field.errors['max'].max}`;
			if (field.errors['pattern']) return `Please enter a valid ${fieldName}`;
			if (field.errors['passwordMismatch']) return 'Passwords do not match';
		}
		return '';
	}
}
