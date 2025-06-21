import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {

	constructor(
		private authService: AuthService,
		private router: Router
	) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> | Promise<boolean> | boolean {

		return this.authService.isAuthenticated$.pipe(
			take(1),
			map(isAuthenticated => {
				if (isAuthenticated) {
					// Check for role-based access if specified in route data
					const requiredRole = route.data?.['role'];
					if (requiredRole && !this.authService.hasRole(requiredRole)) {
						this.router.navigate(['/unauthorized']);
						return false;
					}
					return true;
				} else {
					this.router.navigate(['/login'], {
						queryParams: { returnUrl: state.url }
					});
					return false;
				}
			})
		);
	}
}
