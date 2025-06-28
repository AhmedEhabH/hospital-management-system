import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { MedicalHistoryService } from '../../../core/services/medical-history.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicalHistoryDto } from '../../../core/models/medical-history.model';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Medical History Form Component
 * 
 * Comprehensive form for creating and editing patient medical histories.
 * Integrates with the MedicalHistoryService to provide full CRUD functionality.
 * Features real-time validation, error handling, and user-friendly interface.
 */
@Component({
	selector: 'app-medical-history-form',
	standalone: false,
	templateUrl: './medical-history-form.component.html',
	styleUrls: ['./medical-history-form.component.scss']
})
export class MedicalHistoryFormComponent implements OnInit, OnDestroy {
	medicalHistoryForm: FormGroup;
	isDarkMode = false;
	isLoading = false;
	isEditMode = false;
	currentUser: any = null;
	patientId: number | null = null;

	private destroy$ = new Subject<void>();

	constructor(
		private fb: FormBuilder,
		private medicalHistoryService: MedicalHistoryService,
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private router: Router,
		private route: ActivatedRoute,
		private themeService: ThemeService
	) {
		this.medicalHistoryForm = this.createForm();
	}
	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
		this.subscribeToTheme();
		this.patientId = this.route.snapshot.params['patientId'] || this.currentUser?.id;


		if (this.route.snapshot.params['id']) {
			this.isEditMode = true;
			this.loadMedicalHistory(this.route.snapshot.params['id']);
		}
	}

	private subscribeToTheme(): void {
		this.themeService.isDarkMode$
			.pipe(takeUntil(this.destroy$))
			.subscribe(isDark => {
				this.isDarkMode = isDark;
			});
	}

	/**
	 * Creates the reactive form with comprehensive medical history fields
	 * Includes validation rules for medical data integrity
	 */
	private createForm(): FormGroup {
		return this.fb.group({
			personalHistory: ['', [Validators.maxLength(500)]],
			familyHistory: ['', [Validators.maxLength(500)]],
			allergies: ['', [Validators.maxLength(500)]],
			frequentlyOccurringDisease: ['', [Validators.maxLength(500)]],
			hasAsthma: [false],
			hasBloodPressure: [false],
			hasCholesterol: [false],
			hasDiabetes: [false],
			hasHeartDisease: [false],
			usesTobacco: [false],
			cigarettePacksPerDay: [0, [Validators.min(0), Validators.max(10)]],
			smokingYears: [0, [Validators.min(0), Validators.max(100)]],
			drinksAlcohol: [false],
			alcoholicDrinksPerWeek: [0, [Validators.min(0), Validators.max(50)]],
			currentMedications: ['', [Validators.maxLength(500)]]
		});
	}

	/**
	 * Loads existing medical history for editing
	 * FIXED: Uses correct method name and proper type annotations
	 */
	private loadMedicalHistory(id: number): void {
		this.isLoading = true;

		// FIXED: Use getMedicalHistoryById instead of getMedicalHistory
		this.medicalHistoryService.getMedicalHistoryById(id).subscribe({
			next: (history: MedicalHistoryDto) => { // FIXED: Explicit type annotation
				this.medicalHistoryForm.patchValue(history);
				this.isLoading = false;
			},
			error: (error: any) => { // FIXED: Explicit type annotation
				console.error('Error loading medical history:', error);
				this.snackBar.open('Error loading medical history', 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
				this.isLoading = false;
			}
		});
	}

	/**
	 * Handles form submission for creating or updating medical history
	 * FIXED: Proper Observable subscription with explicit types and separate handling
	 */
	public onSubmit(): void {
		if (this.medicalHistoryForm.valid && this.patientId) {
			this.isLoading = true;

			const formData: MedicalHistoryDto = {
				...this.medicalHistoryForm.value,
				userId: this.patientId
			};

			// FIXED: Handle create and update operations separately to avoid union type issues
			if (this.isEditMode) {
				// Update operation
				this.medicalHistoryService.updateMedicalHistory(this.route.snapshot.params['id'], formData)
					.subscribe({
						next: () => {
							this.snackBar.open(
								'Medical history updated successfully!',
								'Close',
								{
									duration: 3000,
									panelClass: ['success-snackbar']
								}
							);
							this.router.navigate(['/medical-history']);
						},
						error: (error: any) => {
							console.error('Error updating medical history:', error);
							this.snackBar.open('Error updating medical history', 'Close', {
								duration: 3000,
								panelClass: ['error-snackbar']
							});
						},
						complete: () => {
							this.isLoading = false;
						}
					});
			} else {
				// Create operation
				this.medicalHistoryService.createMedicalHistory(formData)
					.subscribe({
						next: (result: MedicalHistoryDto) => {
							this.snackBar.open(
								'Medical history created successfully!',
								'Close',
								{
									duration: 3000,
									panelClass: ['success-snackbar']
								}
							);
							this.router.navigate(['/medical-history']);
						},
						error: (error: any) => {
							console.error('Error creating medical history:', error);
							this.snackBar.open('Error creating medical history', 'Close', {
								duration: 3000,
								panelClass: ['error-snackbar']
							});
						},
						complete: () => {
							this.isLoading = false;
						}
					});
			}
		} else {
			this.markFormGroupTouched();
		}
	}

	/**
	 * Marks all form controls as touched to trigger validation display
	 */
	private markFormGroupTouched(): void {
		Object.keys(this.medicalHistoryForm.controls).forEach(key => {
			this.medicalHistoryForm.get(key)?.markAsTouched();
		});
	}

	/**
	 * Gets appropriate error message for form validation
	 */
	public getErrorMessage(fieldName: string): string {
		const control = this.medicalHistoryForm.get(fieldName);
		if (control?.hasError('required')) {
			return `${fieldName} is required`;
		}
		if (control?.hasError('maxlength')) {
			return `${fieldName} is too long`;
		}
		if (control?.hasError('min')) {
			return `${fieldName} cannot be negative`;
		}
		if (control?.hasError('max')) {
			return `${fieldName} exceeds maximum value`;
		}
		return '';
	}

	/**
	 * Cancels form editing and navigates back
	 */
	public onCancel(): void {
		this.router.navigate(['/medical-history']);
	}

	/**
	 * Checks if a specific form control has errors and is touched
	 */
	public hasError(fieldName: string): boolean {
		const control = this.medicalHistoryForm.get(fieldName);
		return !!(control?.invalid && control?.touched);
	}

	/**
	 * Gets the current form control value
	 */
	public getControlValue(fieldName: string): any {
		return this.medicalHistoryForm.get(fieldName)?.value;
	}

	/**
	 * Resets the form to initial state
	 */
	public resetForm(): void {
		this.medicalHistoryForm.reset();
		this.isEditMode = false;
	}
}
