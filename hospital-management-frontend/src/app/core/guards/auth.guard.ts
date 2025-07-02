import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {

	constructor(
		private authService: AuthService,
		private router: Router
	) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		if (this.authService.isAuthenticated()) {
			// Check if user is trying to access login page while authenticated
			if (state.url.includes('/auth/login')) {
				this.redirectToUserDashboard();
				return false;
			}
			return true;
		} else {
			// User not authenticated, redirect to login
			this.router.navigate(['/auth/login'], {
				queryParams: { returnUrl: state.url }
			});
			return false;
		}
	}

	private redirectToUserDashboard(): void {
		const user = this.authService.getCurrentUser();
		const userType = user?.userType?.toLowerCase();

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
}
