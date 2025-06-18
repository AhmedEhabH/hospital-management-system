import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';


export interface LoginRequest {
	userId: string;
	password: string;
	userType: string;
}

export interface AuthResult {
	success: boolean;
	message: string;
	token?: string;
	user?: UserInfo;
}

export interface UserInfo {
	id: number;
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	userType: string;
}

export interface UserRegistration {
	firstName: string;
	lastName: string;
	gender: string;
	age: number;
	userId: string;
	password: string;
	email: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	phoneNo: string;
	userType: string;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private readonly apiUrl = `${environment.apiUrl}/auth`;
	private currentUserSubject = new BehaviorSubject<any>(null);
	public currentUser$ = this.currentUserSubject.asObservable();

	private tokenSubject = new BehaviorSubject<string | null>(null);
	public token$ = this.tokenSubject.asObservable();

	constructor(
		private http: HttpClient,
		private router: Router
	) {
		// Initialize user from localStorage on service creation
		this.initializeFromStorage();
	}

	private initializeFromStorage(): void {
		const storedUser = localStorage.getItem('currentUser');
		const storedToken = localStorage.getItem('authToken');

		if (storedUser && storedToken) {
			try {
				const user = JSON.parse(storedUser);
				this.currentUserSubject.next(user);
				console.log('User initialized from storage:', user);
			} catch (error) {
				console.error('Error parsing stored user:', error);
				this.logout();
			}
		}
	}

	hasRole(role: string): boolean {
		const user = this.getCurrentUser();
		return user?.userType === role;
	}

	login(credentials: any): Observable<AuthResult> {
		return this.http.post<any>(`${this.apiUrl}/login`, credentials)
			.pipe(
				map(response => {
					if (response && response.token) {
						// Store user details and jwt token in local storage
						localStorage.setItem('authToken', response.token);
						localStorage.setItem('currentUser', JSON.stringify(response.user));
						this.currentUserSubject.next(response.user);

						return {
							success: true,
							message: 'Login successful',
							token: response.token,
							user: response.user
						};
					} else {
						return {
							success: false,
							message: 'Invalid credentials'
						};
					}
				}),
				catchError(error => {
					console.error('Login error:', error);
					return of({
						success: false,
						message: error.error?.message || 'Login failed. Please try again.'
					});
				})
			);
	}

	logout(): void {
		// Remove user from local storage and set current user to null
		localStorage.removeItem('authToken');
		localStorage.removeItem('currentUser');
		localStorage.removeItem('darkMode'); // Optional: reset theme on logout
		this.currentUserSubject.next(null);
	}

	getCurrentUser(): any {
		return this.currentUserSubject.value;
	}

	isAuthenticated(): boolean {
		const token = localStorage.getItem('authToken');
		const user = this.getCurrentUser();
		return !!(token && user);
	}

	getToken(): string | null {
		return localStorage.getItem('authToken');
	}

	register(userData: any): Observable<any> {
		return this.http.post<any>(`${this.apiUrl}/register`, userData)
			.pipe(
				catchError(error => {
					console.error('Registration error:', error);
					return of({
						success: false,
						message: error.error?.message || 'Registration failed. Please try again.'
					});
				})
			);
	}
}
