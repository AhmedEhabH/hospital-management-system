import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { LabReportService } from '../../../core/services/lab-report.service';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { LabReportDto } from '../../../core/models/lab-report.model';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Lab Report Form Component
 * 
 * Comprehensive form for creating and editing patient lab reports with real-time critical alerts.
 * Integrates with LabReportService for CRUD operations and SignalR for critical medical notifications.
 * Features medical validation, error handling, and professional healthcare interface.
 */
@Component({
	selector: 'app-lab-report-form',
	standalone: false,
	templateUrl: './lab-report-form.component.html',
	styleUrls: ['./lab-report-form.component.scss']
})
export class LabReportFormComponent implements OnInit, OnDestroy {

	private destroy$ = new Subject<void>();

	labReportForm: FormGroup;
	isLoading = false;
	isDarkMode = false;
	isEditMode = false;
	currentUser: any = null;
	patientId: number | null = null;

	// Medical reference ranges for validation
	medicalRanges = {
		phLevel: { min: 6.5, max: 8.5, normal: { min: 7.35, max: 7.45 } },
		cholesterol: { normal: 200, high: 240 },
		bloodSugar: { normal: { min: 70, max: 99 }, high: 126 },
		whiteBloodCells: { normal: { min: 4.5, max: 11.0 } },
		redBloodCells: { normal: { min: 4.1, max: 5.9 } },
		heartRate: { normal: { min: 60, max: 100 } }
	};

	constructor(
		private fb: FormBuilder,
		private labReportService: LabReportService,
		private signalrService: SignalrService,
		private authService: AuthService,
		private snackBar: MatSnackBar,
		private router: Router,
		private route: ActivatedRoute,
		private themeService: ThemeService,
	) {
		this.labReportForm = this.createForm();
	}

	ngOnInit(): void {
		this.subscribeToTheme();
		this.currentUser = this.authService.getCurrentUser();
		this.patientId = this.route.snapshot.params['patientId'] || this.currentUser?.id;

		if (this.route.snapshot.params['id']) {
			this.isEditMode = true;
			this.loadLabReport(this.route.snapshot.params['id']);
		}
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
	 * Creates reactive form with comprehensive lab report fields and medical validation
	 */
	private createForm(): FormGroup {
		const currentUser = this.authService.getCurrentUser();

		return this.fb.group({
			testedBy: [
				currentUser ? `Dr. ${currentUser.firstName} ${currentUser.lastName}` : '',
				[Validators.required, Validators.maxLength(100)]
			],
			testPerformed: ['', [Validators.required, Validators.maxLength(200)]],
			phLevel: [0, [Validators.min(0), Validators.max(14)]],
			cholesterolLevel: [0, [Validators.min(0), Validators.max(500)]],
			sucroseLevel: [0, [Validators.min(0), Validators.max(300)]],
			whiteBloodCellsRatio: [0, [Validators.min(0), Validators.max(50000)]],
			redBloodCellsRatio: [0, [Validators.min(0), Validators.max(10)]],
			heartBeatRatio: [0, [Validators.min(30), Validators.max(200)]],
			reports: ['', [Validators.maxLength(1000)]],
			testedDate: [new Date().toISOString().split('T')[0], [Validators.required]]
		});
	}

	/**
	 * Loads existing lab report for editing
	 */
	private loadLabReport(id: number): void {
		this.isLoading = true;

		this.labReportService.getLabReportById(id).subscribe({
			next: (report: LabReportDto) => {
				this.labReportForm.patchValue({
					...report,
					testedDate: new Date(report.testedDate).toISOString().split('T')[0]
				});
				this.isLoading = false;
			},
			error: (error: any) => {
				console.error('Error loading lab report:', error);
				this.snackBar.open('Error loading lab report', 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
				this.isLoading = false;
			}
		});
	}

	/**
	 * Handles form submission with critical value detection and SignalR alerts
	 */
	public onSubmit(): void {
		if (this.labReportForm.valid && this.patientId) {
			this.isLoading = true;

			const formData: LabReportDto = {
				...this.labReportForm.value,
				patientId: this.patientId,
				testedDate: new Date(this.labReportForm.value.testedDate).toISOString()
			};

			if (this.isEditMode) {
				this.updateLabReport(formData);
			} else {
				this.createLabReport(formData);
			}
		} else {
			this.markFormGroupTouched();
		}
	}

	/**
	 * Creates new lab report and checks for critical values
	 */
	private createLabReport(formData: LabReportDto): void {
		this.labReportService.createLabReport(formData).subscribe({
			next: (result: LabReportDto) => {
				this.snackBar.open('Lab report created successfully!', 'Close', {
					duration: 3000,
					panelClass: ['success-snackbar']
				});

				// Check for critical values and send SignalR alert
				this.checkAndSendCriticalAlert(result);

				this.router.navigate(['/lab-reports']);
			},
			error: (error: any) => {
				console.error('Error creating lab report:', error);
				this.snackBar.open('Error creating lab report', 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
			},
			complete: () => {
				this.isLoading = false;
			}
		});
	}

	/**
	 * Updates existing lab report
	 */
	private updateLabReport(formData: LabReportDto): void {
		this.labReportService.updateLabReport(this.route.snapshot.params['id'], formData).subscribe({
			next: () => {
				this.snackBar.open('Lab report updated successfully!', 'Close', {
					duration: 3000,
					panelClass: ['success-snackbar']
				});
				this.router.navigate(['/lab-reports']);
			},
			error: (error: any) => {
				console.error('Error updating lab report:', error);
				this.snackBar.open('Error updating lab report', 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
			},
			complete: () => {
				this.isLoading = false;
			}
		});
	}

	/**
	 * Checks lab values for critical ranges and sends real-time SignalR alerts
	 */
	private async checkAndSendCriticalAlert(report: LabReportDto): Promise<void> {
		const criticalAlerts: string[] = [];

		// Check cholesterol levels
		if (report.cholesterolLevel > this.medicalRanges.cholesterol.high) {
			criticalAlerts.push(`Critical Cholesterol Level: ${report.cholesterolLevel} mg/dL (Normal: <${this.medicalRanges.cholesterol.normal})`);
		}

		// Check blood sugar levels
		if (report.sucroseLevel > this.medicalRanges.bloodSugar.high) {
			criticalAlerts.push(`Critical Blood Sugar Level: ${report.sucroseLevel} mg/dL (Normal: ${this.medicalRanges.bloodSugar.normal.min}-${this.medicalRanges.bloodSugar.normal.max})`);
		}

		// Check pH levels
		if (report.phLevel < this.medicalRanges.phLevel.normal.min || report.phLevel > this.medicalRanges.phLevel.normal.max) {
			criticalAlerts.push(`Critical pH Level: ${report.phLevel} (Normal: ${this.medicalRanges.phLevel.normal.min}-${this.medicalRanges.phLevel.normal.max})`);
		}

		// Check white blood cell count
		if (report.whiteBloodCellsRatio < this.medicalRanges.whiteBloodCells.normal.min ||
			report.whiteBloodCellsRatio > this.medicalRanges.whiteBloodCells.normal.max) {
			criticalAlerts.push(`Critical WBC Count: ${report.whiteBloodCellsRatio} x10^9/L (Normal: ${this.medicalRanges.whiteBloodCells.normal.min}-${this.medicalRanges.whiteBloodCells.normal.max})`);
		}

		// Check heart rate
		if (report.heartBeatRatio < this.medicalRanges.heartRate.normal.min ||
			report.heartBeatRatio > this.medicalRanges.heartRate.normal.max) {
			criticalAlerts.push(`Critical Heart Rate: ${report.heartBeatRatio} bpm (Normal: ${this.medicalRanges.heartRate.normal.min}-${this.medicalRanges.heartRate.normal.max})`);
		}

		// Send SignalR alerts for critical values
		if (criticalAlerts.length > 0) {
			try {
				await this.signalrService.sendCriticalAlert({
					patientId: report.patientId,
					labReportId: report.id || 0,
					alertMessage: `CRITICAL LAB VALUES DETECTED: ${criticalAlerts.join('; ')}`,
					alertType: 'Critical',
					doctorName: report.testedBy,
					patientName: `Patient ID: ${report.patientId}` // You may want to fetch actual patient name
				});

				this.snackBar.open(
					`🚨 Critical values detected! Medical staff have been alerted.`,
					'Close',
					{
						duration: 5000,
						panelClass: ['warning-snackbar']
					}
				);
			} catch (error) {
				console.error('Error sending critical alert:', error);
				this.snackBar.open('Critical values detected but alert failed to send', 'Close', {
					duration: 3000,
					panelClass: ['error-snackbar']
				});
			}
		}
	}

	/**
	 * Gets medical status based on lab values
	 */
	public getMedicalStatus(fieldName: string, value: number): { status: string; class: string } {
		switch (fieldName) {
			case 'cholesterolLevel':
				if (value > this.medicalRanges.cholesterol.high) return { status: 'Critical', class: 'status-critical' };
				if (value > this.medicalRanges.cholesterol.normal) return { status: 'High', class: 'status-warning' };
				return { status: 'Normal', class: 'status-stable' };

			case 'phLevel':
				if (value < this.medicalRanges.phLevel.normal.min || value > this.medicalRanges.phLevel.normal.max) {
					return { status: 'Critical', class: 'status-critical' };
				}
				return { status: 'Normal', class: 'status-stable' };

			default:
				return { status: 'Normal', class: 'status-stable' };
		}
	}

	/**
	 * Marks all form controls as touched for validation display
	 */
	private markFormGroupTouched(): void {
		Object.keys(this.labReportForm.controls).forEach(key => {
			this.labReportForm.get(key)?.markAsTouched();
		});
	}

	/**
	 * Gets error message for form validation
	 */
	public getErrorMessage(fieldName: string): string {
		const control = this.labReportForm.get(fieldName);
		if (control?.hasError('required')) {
			return `${fieldName} is required`;
		}
		if (control?.hasError('maxlength')) {
			return `${fieldName} is too long`;
		}
		if (control?.hasError('min')) {
			return `${fieldName} cannot be below minimum value`;
		}
		if (control?.hasError('max')) {
			return `${fieldName} exceeds maximum value`;
		}
		return '';
	}

	/**
	 * Checks if form control has errors and is touched
	 */
	public hasError(fieldName: string): boolean {
		const control = this.labReportForm.get(fieldName);
		return !!(control?.invalid && control?.touched);
	}

	/**
	 * Gets current form control value
	 */
	public getControlValue(fieldName: string): any {
		return this.labReportForm.get(fieldName)?.value;
	}

	/**
	 * Cancels form and navigates back
	 */
	public onCancel(): void {
		this.router.navigate(['/lab-reports']);
	}

	/**
	 * Resets form to initial state
	 */
	public resetForm(): void {
		this.labReportForm.reset();
		this.isEditMode = false;
	}
}
