import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthResultDto } from '../../../core/models/user.model';

@Component({
	selector: 'app-login',
	standalone: false,
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
	loginForm!: FormGroup;
	isLoading = false;
	hidePassword = true;
	isDarkMode = false;
	returnUrl: string = '';
	private destroy$ = new Subject<void>();

	userTypes = [
		{
			value: 'Admin',
			label: 'Administrator',
			icon: 'admin_panel_settings',
			description: 'System Management & Configuration'
		},
		{
			value: 'Doctor',
			label: 'Medical Doctor',
			icon: 'medical_services',
			description: 'Patient Care & Medical Records'
		},
		{
			value: 'Patient',
			label: 'Patient',
			icon: 'person',
			description: 'Health Records & Appointments'
		}
	];

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private themeService: ThemeService,
		private router: Router,
		private snackBar: MatSnackBar,
		private route: ActivatedRoute,
	) { }

	ngOnInit(): void {
		this.initializeForm();
		this.subscribeToTheme();
		// Check if user is already authenticated
		if (this.authService.isAuthenticated()) {
			this.redirectToUserDashboard();
			return;
		}
		// Get return URL from route parameters
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private redirectToUserDashboard(): void {
		const user = this.authService.getCurrentUser();
		const userType = user?.userType?.toLowerCase();
		console.log(user);
		console.log(userType);


		switch (userType) {
			case 'admin':
				this.router.navigate(['/admin/dashboard']);
				break;
			case 'doctor':
				this.router.navigate(['/doctor/dashboard']);
				break;
			case 'patient':
				this.router.navigate(['/patient/dashboard']);
				break;
			default:
				this.router.navigate(['/patient/dashboard']);
				break;
		}
	}

	private initializeForm(): void {
		this.loginForm = this.fb.group({
			userId: ['', [Validators.required, Validators.minLength(3)]],
			password: ['', [Validators.required, Validators.minLength(6)]],
			userType: ['Patient', Validators.required]
		});
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	onSubmit(): void {
		if (this.loginForm.valid && !this.isLoading) {
			this.isLoading = true;
			const credentials = this.loginForm.value;

			this.authService.login(credentials)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (result: AuthResultDto) => {
						this.isLoading = false;
						if (result.success) {
							this.showSuccess('Welcome back! Login successful.');
							// this.navigateBasedOnRole(result.user?.userType);
							this.snackBar.open('Login successful!', 'Close', {
								duration: 3000,
								panelClass: ['success-snackbar']
							});
						} else {
							this.showError(result.message);
							this.snackBar.open(result.message || 'Login failed', 'Close', {
								duration: 3000,
								panelClass: ['error-snackbar']
							});
						}
					},
					error: (error: any) => {
						this.isLoading = false;
						this.showError('Authentication failed. Please check your credentials and try again.');
						console.error('Login error:', error);
					}
				});
		} else {
			this.markFormGroupTouched();
		}
	}

	private markFormGroupTouched(): void {
		Object.keys(this.loginForm.controls).forEach(key => {
			this.loginForm.get(key)?.markAsTouched();
		});
	}

	private navigateBasedOnRole(userType?: string): void {
		switch (userType) {
			case 'Admin':
				this.router.navigate(['/admin-dashboard']);
				break;
			case 'Doctor':
				this.router.navigate(['/doctor-dashboard']);
				break;
			case 'Patient':
				this.router.navigate(['/patient-dashboard']);
				break;
			default:
				this.router.navigate(['/dashboard']);
		}
	}

	private showSuccess(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 4000,
			panelClass: ['success-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}

	private showError(message: string): void {
		this.snackBar.open(message, 'Close', {
			duration: 6000,
			panelClass: ['error-snackbar'],
			horizontalPosition: 'end',
			verticalPosition: 'top'
		});
	}

	getFieldError(fieldName: string): string {
		const field = this.loginForm.get(fieldName);
		if (field?.errors && field.touched) {
			if (field.errors['required']) {
				return `${this.getFieldDisplayName(fieldName)} is required`;
			}
			if (field.errors['minlength']) {
				return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
			}
		}
		return '';
	}

	private getFieldDisplayName(fieldName: string): string {
		const displayNames: { [key: string]: string } = {
			userId: 'User ID',
			password: 'Password',
			userType: 'User Type'
		};
		return displayNames[fieldName] || fieldName;
	}
}
