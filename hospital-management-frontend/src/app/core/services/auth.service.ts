import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
	LoginDto,
	AuthResultDto,
	UserRegistrationDto,
	RegistrationResultDto,
	UserInfoDto
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private readonly apiUrl = `${environment.apiUrl}/api/Auth`;
	private currentUserSubject = new BehaviorSubject<UserInfoDto | null>(null);
	private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

	public currentUser$ = this.currentUserSubject.asObservable();
	public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

	constructor(
		private http: HttpClient,
		private router: Router
	) {
		this.initializeAuth();
	}

	private initializeAuth(): void {
		const token = this.getToken();
		const user = this.getStoredUser();

		if (token && user) {
			this.currentUserSubject.next(user);
			this.isAuthenticatedSubject.next(true);
		}
	}

	login(loginData: LoginDto): Observable<AuthResultDto> {
		return this.http.post<AuthResultDto>(`${this.apiUrl}/login`, loginData)
			.pipe(
				tap(response => {
					if (response.success && response.token && response.user) {
						this.setToken(response.token);
						this.setUser(response.user);
						this.currentUserSubject.next(response.user);
						this.isAuthenticatedSubject.next(true);
					}
				}),
				catchError(this.handleError)
			);
	}

	register(registrationData: UserRegistrationDto): Observable<RegistrationResultDto> {
		return this.http.post<RegistrationResultDto>(`${this.apiUrl}/register`, registrationData)
			.pipe(
				catchError(this.handleError)
			);
	}

	logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		this.currentUserSubject.next(null);
		this.isAuthenticatedSubject.next(false);
		this.router.navigate(['/login']);
	}

	getToken(): string | null {
		return localStorage.getItem('token');
	}

	getCurrentUser(): UserInfoDto | null {
		return this.currentUserSubject.value;
	}

	isAuthenticated(): boolean {
		return this.isAuthenticatedSubject.value;
	}

	hasRole(role: string): boolean {
		const user = this.getCurrentUser();
		return user?.userType === role;
	}

	private setToken(token: string): void {
		localStorage.setItem('token', token);
	}

	private setUser(user: UserInfoDto): void {
		localStorage.setItem('user', JSON.stringify(user));
	}

	private getStoredUser(): UserInfoDto | null {
		const userStr = localStorage.getItem('user');
		return userStr ? JSON.parse(userStr) : null;
	}

	private handleError(error: any): Observable<never> {
		console.error('Auth Service Error:', error);
		return throwError(() => error);
	}
}
