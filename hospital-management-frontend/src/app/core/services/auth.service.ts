import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';

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
	private currentUserSubject = new BehaviorSubject<any>(null);
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
	login(credentials: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/login`, credentials)
			.pipe(
				tap(response => {
					if (response.success && response.token && response.user) {
						// Store authentication data
						localStorage.setItem('auth-token', response.token);
						localStorage.setItem('current-user', JSON.stringify(response.user));

						// Update subjects
						this.currentUserSubject.next(response.user);
						this.isAuthenticatedSubject.next(true);

						// Navigate based on user role
						this.navigateAfterLogin(response.user);
					}
				}),
				catchError(this.handleError)
			);
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
