import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard {

	constructor(
		private authService: AuthService,
		private router: Router
	) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		const isAuthenticated = this.authService.isAuthenticated();

		if (!isAuthenticated) {
			console.log('User not authenticated, redirecting to login');
			this.router.navigate(['/auth/login'], {
				queryParams: { returnUrl: state.url }
			});
			return false;
		}

		// Check role-based access if specified in route data
		const requiredRole = route.data['role'];
		if (requiredRole) {
			const currentUser = this.authService.getCurrentUser();
			if (!currentUser || currentUser.userType !== requiredRole) {
				console.log(`Access denied. Required role: ${requiredRole}, User role: ${currentUser?.userType}`);
				this.router.navigate(['/auth/login']);
				return false;
			}
		}

		return true;
	}
}
