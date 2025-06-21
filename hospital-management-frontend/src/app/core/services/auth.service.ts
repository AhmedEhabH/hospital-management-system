import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
	LoginDto,
	AuthResultDto,
	UserRegistrationDto,
	RegistrationResultDto,
	UserInfoDto
} from '../models/dtos';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private apiUrl = `${environment.apiUrl}/api/Auth`;
	private currentUserSubject = new BehaviorSubject<UserInfoDto | null>(null);
	private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

	public currentUser$ = this.currentUserSubject.asObservable();
	public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

	constructor(private http: HttpClient) {
		this.loadUserFromStorage();
	}

	private loadUserFromStorage(): void {
		const token = localStorage.getItem('token');
		const user = localStorage.getItem('user');

		if (token && user) {
			this.currentUserSubject.next(JSON.parse(user));
			this.isAuthenticatedSubject.next(true);
		}
	}

	login(loginData: LoginDto): Observable<AuthResultDto> {
		return this.http.post<AuthResultDto>(`${this.apiUrl}/login`, loginData)
			.pipe(
				tap(result => {
					if (result.success && result.token && result.user) {
						localStorage.setItem('token', result.token);
						localStorage.setItem('user', JSON.stringify(result.user));
						this.currentUserSubject.next(result.user);
						this.isAuthenticatedSubject.next(true);
					}
				})
			);
	}

	register(registrationData: UserRegistrationDto): Observable<RegistrationResultDto> {
		return this.http.post<RegistrationResultDto>(`${this.apiUrl}/register`, registrationData);
	}

	logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		this.currentUserSubject.next(null);
		this.isAuthenticatedSubject.next(false);
	}

	getCurrentUser(): UserInfoDto | null {
		return this.currentUserSubject.value;
	}

	getToken(): string | null {
		return localStorage.getItem('token');
	}

	isAuthenticated(): boolean {
		return this.isAuthenticatedSubject.value;
	}

	// FIXED: Add missing hasRole method
	hasRole(role: string): boolean {
		const currentUser = this.getCurrentUser();
		if (!currentUser) {
			return false;
		}

		// Define role hierarchy
		const roleHierarchy: { [key: string]: number } = {
			'Patient': 1,
			'Doctor': 2,
			'Admin': 3
		};

		const userRoleLevel = roleHierarchy[currentUser.userType] || 0;
		const requiredRoleLevel = roleHierarchy[role] || 0;

		// User has role if their level is greater than or equal to required level
		return userRoleLevel >= requiredRoleLevel;
	}
}
