import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRegistrationDto, RegistrationResultDto } from '../../../core/models';
import { ThemeService } from '../../../core/services/theme.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Patient Registration Form Component
 * 
 * Comprehensive multi-step patient registration with medical information
 * Features validation, error handling, and professional healthcare interface
 */
@Component({
	selector: 'app-patient-registration',
	standalone: false,
	templateUrl: './patient-registration.component.html',
	styleUrls: ['./patient-registration.component.scss']
})
export class PatientRegistrationComponent implements OnInit, OnDestroy {
	registrationForm: FormGroup;
	isLoading = false;
	isDarkMode = false;
	currentStep = 1;
	totalSteps = 3;

	// Form validation states
	personalInfoValid = false;
	contactInfoValid = false;
	medicalInfoValid = false;

	private destroy$ = new Subject<void>();

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private router: Router,
		private themeService: ThemeService
	) {
		this.registrationForm = this.createForm();

	}

	ngOnInit(): void {
		this.setupFormValidation();
		this.subscribeToTheme();
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
			});
	}

	/**
	 * Creates comprehensive registration form with medical validation
	 */
	private createForm(): FormGroup {
		return this.fb.group({
			// Personal Information
			firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
			lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
			gender: ['', [Validators.required]],
			age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
			dateOfBirth: ['', [Validators.required]],

			// Account Information
			userId: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
			password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
			confirmPassword: ['', [Validators.required]],
			email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],

			// Contact Information
			address: ['', [Validators.required, Validators.maxLength(200)]],
			city: ['', [Validators.required, Validators.maxLength(50)]],
			state: ['', [Validators.required, Validators.maxLength(50)]],
			zip: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
			phoneNo: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{10,15}$/)]],

			// Emergency Contact
			emergencyContactName: ['', [Validators.maxLength(100)]],
			emergencyContactPhone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]{10,15}$/)]],
			emergencyContactRelation: ['', [Validators.maxLength(50)]],

			// Insurance Information
			insuranceProvider: ['', [Validators.maxLength(100)]],
			insurancePolicyNumber: ['', [Validators.maxLength(50)]],

			// Medical Information
			medicalConditions: ['', [Validators.maxLength(500)]],
			currentMedications: ['', [Validators.maxLength(500)]],
			allergies: ['', [Validators.maxLength(500)]],

			// Terms and Privacy
			agreeToTerms: [false, [Validators.requiredTrue]],
			agreeToPrivacy: [false, [Validators.requiredTrue]]
		}, { validators: this.passwordMatchValidator });
	}

	/**
	 * Custom password validator
	 */
	private passwordValidator(control: AbstractControl): { [key: string]: any } | null {
		const value = control.value;
		if (!value) return null;

		const hasNumber = /[0-9]/.test(value);
		const hasUpper = /[A-Z]/.test(value);
		const hasLower = /[a-z]/.test(value);
		const hasSpecial = /[#?!@$%^&*-]/.test(value);

		const valid = hasNumber && hasUpper && hasLower && hasSpecial;
		if (!valid) {
			return { passwordStrength: true };
		}
		return null;
	}

	/**
	 * Password match validator
	 */
	private passwordMatchValidator(form: AbstractControl): { [key: string]: any } | null {
		const password = form.get('password');
		const confirmPassword = form.get('confirmPassword');

		if (password && confirmPassword && password.value !== confirmPassword.value) {
			return { passwordMismatch: true };
		}
		return null;
	}

	/**
	 * Sets up form validation monitoring
	 */
	private setupFormValidation(): void {
		// Monitor personal info validation
		this.registrationForm.valueChanges.subscribe(() => {
			this.personalInfoValid = this.isPersonalInfoValid();
			this.contactInfoValid = this.isContactInfoValid();
			this.medicalInfoValid = this.isMedicalInfoValid();
		});
	}

	/**
	 * Validates personal information step
	 */
	private isPersonalInfoValid(): boolean {
		const personalFields = ['firstName', 'lastName', 'gender', 'age', 'dateOfBirth', 'userId', 'password', 'confirmPassword', 'email'];
		return personalFields.every(field => {
			const control = this.registrationForm.get(field);
			return control && control.valid;
		}) && !this.registrationForm.hasError('passwordMismatch');
	}

	/**
	 * Validates contact information step
	 */
	private isContactInfoValid(): boolean {
		const contactFields = ['address', 'city', 'state', 'zip', 'phoneNo'];
		return contactFields.every(field => {
			const control = this.registrationForm.get(field);
			return control && control.valid;
		});
	}

	/**
	 * Validates medical information step
	 */
	private isMedicalInfoValid(): boolean {
		const termsControl = this.registrationForm.get('agreeToTerms');
		const privacyControl = this.registrationForm.get('agreeToPrivacy');

		return !!(termsControl?.valid && termsControl?.value &&
			privacyControl?.valid && privacyControl?.value);
	}

	/**
	 * Proceeds to next step
	 */
	public nextStep(): void {
		if (this.currentStep === 1 && this.personalInfoValid) {
			this.currentStep = 2;
		} else if (this.currentStep === 2 && this.contactInfoValid) {
			this.currentStep = 3;
		}
	}

	/**
	 * Goes back to previous step
	 */
	public previousStep(): void {
		if (this.currentStep > 1) {
			this.currentStep--;
		}
	}

	/**
	 * Handles form submission
	 */
	public onSubmit(): void {
		if (this.registrationForm.valid) {
			this.isLoading = true;

			const formData: UserRegistrationDto = {
				...this.registrationForm.value,
				userType: 'Patient',
				dateOfBirth: new Date(this.registrationForm.value.dateOfBirth).toISOString()
			};

			// Remove confirm password and agreement fields
			delete (formData as any).confirmPassword;
			delete (formData as any).agreeToTerms;
			delete (formData as any).agreeToPrivacy;

			this.authService.register(formData).subscribe({
				next: (result: RegistrationResultDto) => {
					if (result.success) {
						this.snackBar.open(
							'Registration successful! Welcome to our hospital management system.',
							'Close',
							{
								duration: 5000,
								panelClass: ['success-snackbar']
							}
						);
						this.router.navigate(['/auth/login'], {
							queryParams: { registered: 'true', userId: formData.userId }
						});
					} else {
						this.snackBar.open(
							result.message || 'Registration failed. Please try again.',
							'Close',
							{
								duration: 5000,
								panelClass: ['error-snackbar']
							}
						);
					}
				},
				error: (error) => {
					console.error('Registration error:', error);
					this.snackBar.open(
						'Registration failed. Please check your information and try again.',
						'Close',
						{
							duration: 5000,
							panelClass: ['error-snackbar']
						}
					);
				},
				complete: () => {
					this.isLoading = false;
				}
			});
		} else {
			this.markFormGroupTouched();
			this.snackBar.open(
				'Please fill in all required fields correctly.',
				'Close',
				{ duration: 3000 }
			);
		}
	}

	/**
	 * Marks all form controls as touched
	 */
	private markFormGroupTouched(): void {
		Object.keys(this.registrationForm.controls).forEach(key => {
			this.registrationForm.get(key)?.markAsTouched();
		});
	}

	/**
	 * Gets error message for form field
	 */
	public getErrorMessage(fieldName: string): string {
		const control = this.registrationForm.get(fieldName);
		if (control?.hasError('required')) {
			return `${this.getFieldDisplayName(fieldName)} is required`;
		}
		if (control?.hasError('email')) {
			return 'Please enter a valid email address';
		}
		if (control?.hasError('minlength')) {
			return `${this.getFieldDisplayName(fieldName)} is too short`;
		}
		if (control?.hasError('maxlength')) {
			return `${this.getFieldDisplayName(fieldName)} is too long`;
		}
		if (control?.hasError('pattern')) {
			return `Please enter a valid ${this.getFieldDisplayName(fieldName)}`;
		}
		if (control?.hasError('passwordStrength')) {
			return 'Password must contain uppercase, lowercase, number, and special character';
		}
		if (this.registrationForm.hasError('passwordMismatch') && fieldName === 'confirmPassword') {
			return 'Passwords do not match';
		}
		return '';
	}

	/**
	 * Gets display name for field
	 */
	private getFieldDisplayName(fieldName: string): string {
		const displayNames: { [key: string]: string } = {
			firstName: 'First Name',
			lastName: 'Last Name',
			dateOfBirth: 'Date of Birth',
			userId: 'User ID',
			phoneNo: 'Phone Number',
			emergencyContactName: 'Emergency Contact Name',
			emergencyContactPhone: 'Emergency Contact Phone',
			emergencyContactRelation: 'Emergency Contact Relation',
			insuranceProvider: 'Insurance Provider',
			insurancePolicyNumber: 'Insurance Policy Number',
			medicalConditions: 'Medical Conditions',
			currentMedications: 'Current Medications'
		};
		return displayNames[fieldName] || fieldName;
	}

	/**
	 * Checks if form field has error and is touched
	 */
	public hasError(fieldName: string): boolean {
		const control = this.registrationForm.get(fieldName);
		return !!(control?.invalid && control?.touched);
	}

	/**
	 * Gets form control value
	 */
	public getControlValue(fieldName: string): any {
		return this.registrationForm.get(fieldName)?.value;
	}

	/**
	 * Cancels registration and navigates back
	 */
	public onCancel(): void {
		this.router.navigate(['/auth/login']);
	}

	/**
	 * Gets progress percentage
	 */
	public getProgressPercentage(): number {
		return (this.currentStep / this.totalSteps) * 100;
	}
}
