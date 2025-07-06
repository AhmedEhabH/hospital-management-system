import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class RoleGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		const expectedRoles = route.data['expectedRoles'] as Array<string>;
		const user = this.authService.getCurrentUser();

		if (!this.authService.isAuthenticated() || !user) {
			this.router.navigate(['/auth/login']);
			return false;
		}

		const hasRole = expectedRoles.some(role => user.userType.toLowerCase() === role.toLowerCase());

		if (hasRole) {
			return true;
		} else {
			// Redirect to a 'not-authorized' page or their own dashboard
			this.router.navigate(['/auth/unauthorized']);
			return false;
		}
	}
}
