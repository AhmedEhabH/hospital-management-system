import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';
import { AuthResultDto, CurrentUserDto, LoginDto, UserInfoDto } from '../models';

/**
 * Authentication Service
 * 
 * Handles user authentication, token management, and navigation routing
 * with proper role-based redirection after successful login
 */
@Injectable({
	providedIn: 'root'
})
export class AuthService extends BaseService {
	private readonly apiUrl = `${environment.apiUrl}/api/Auth`;
	private currentUserSubject = new BehaviorSubject<CurrentUserDto | null>(null);
	private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

	public currentUser$ = this.currentUserSubject.asObservable();
	public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

	constructor(
		private http: HttpClient,
		private router: Router
	) {
		super();
		this.initializeAuth();
	}

	/**
	 * Initialize authentication state from stored token
	 */
	private initializeAuth(): void {
		const token = this.getToken();
		const user = this.getCurrentUser();

		if (token && user) {
			this.currentUserSubject.next(user);
			this.isAuthenticatedSubject.next(true);
		}
	}

	/**
	 * Login user and handle navigation
	 */
	login(loginData: LoginDto): Observable<AuthResultDto> {
		return this.http.post<any>(`${this.apiUrl}/login`, loginData)
			.pipe(
				tap(response => {
					if (response.success && response.token && response.user) {
						// Store authentication data
						localStorage.setItem('auth-token', response.token);
						localStorage.setItem('current-user', JSON.stringify(response.user));

						// Update subjects
						const currentUser = this.mapToCurrentUser(response.user);
						this.currentUserSubject.next(currentUser);
						this.isAuthenticatedSubject.next(true);

						// Navigate based on user role
						this.navigateAfterLogin(response.user);
					}
				}),
				catchError(this.handleError)
			);
	}

	private mapToCurrentUser(user: UserInfoDto): CurrentUserDto {
		return {
			id: user.id,
			userId: user.userId,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			userType: user.userType as 'Admin' | 'Doctor' | 'Patient',
			fullName: `${user.firstName} ${user.lastName}`,
			displayName: `${user.firstName} ${user.lastName}`,
			isActive: true,
			permissions: this.getDefaultPermissions(user.userType)
		};
	}

	private getDefaultPermissions(userType: string): string[] {
		switch (userType) {
			case 'Admin':
				return ['read', 'write', 'delete', 'manage_users', 'manage_system'];
			case 'Doctor':
				return ['read', 'write', 'manage_patients', 'create_reports'];
			case 'Patient':
				return ['read', 'view_own_data', 'send_messages'];
			default:
				return ['read'];
		}
	}

	/**
	 * Navigate user to appropriate dashboard based on role
	 */
	private navigateAfterLogin(user: any): void {
		const userType = user.userType?.toLowerCase();

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

	/**
	 * Register new user
	 */
	register(userData: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/register`, userData)
			.pipe(catchError(this.handleError));
	}

	/**
	 * Logout user and clear authentication
	 */
	logout(): void {
		localStorage.removeItem('auth-token');
		localStorage.removeItem('current-user');
		this.currentUserSubject.next(null);
		this.isAuthenticatedSubject.next(false);
		this.router.navigate(['/auth/login']);
	}

	/**
	 * Get stored authentication token
	 */
	getToken(): string | null {
		return localStorage.getItem('auth-token');
	}

	/**
	 * Get current user from storage
	 */
	getCurrentUser(): any {
		const userStr = localStorage.getItem('current-user');
		return userStr ? JSON.parse(userStr) : null;
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		const token = this.getToken();
		const user = this.getCurrentUser();
		return !!(token && user);
	}

	/**
	 * Check if user has specific role
	 */
	hasRole(role: string): boolean {
		const user = this.getCurrentUser();
		return user?.userType?.toLowerCase() === role.toLowerCase();
	}
}
