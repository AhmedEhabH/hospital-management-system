import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-logout-button',
	standalone: false,
	templateUrl: './logout-button.component.html',
	styleUrls: ['./logout-button.component.scss']
})
export class LogoutButtonComponent implements OnInit {
	currentUser: any;

	constructor(
		private authService: AuthService,
		private router: Router,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getCurrentUser();
	}

	logout(): void {
		// Show confirmation dialog
		const confirmLogout = confirm('Are you sure you want to logout?');

		if (confirmLogout) {
			// Clear authentication data
			this.authService.logout();

			// Show success message
			this.snackBar.open('Logged out successfully', 'Close', {
				duration: 3000,
				panelClass: ['success-snackbar'],
				horizontalPosition: 'end',
				verticalPosition: 'top'
			});

			// Navigate to login page
			this.router.navigate(['/auth/login']);
		}
	}
}
