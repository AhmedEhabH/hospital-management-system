import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';


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
	private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
	private tokenSubject = new BehaviorSubject<string | null>(null);

	public currentUser$ = this.currentUserSubject.asObservable();
	public token$ = this.tokenSubject.asObservable();

	constructor(
		private http: HttpClient,
		private router: Router
	) {
		this.loadStoredAuth();
	}

	login(credentials: LoginRequest): Observable<AuthResult> {
		return this.http.post<AuthResult>(`${this.apiUrl}/login`, credentials)
			.pipe(
				tap(result => {
					if (result.success && result.token && result.user) {
						this.setAuth(result.token, result.user);
					}
				})
			);
	}

	register(userData: UserRegistration): Observable<any> {
		return this.http.post(`${this.apiUrl}/register`, userData);
	}

	logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		this.currentUserSubject.next(null);
		this.tokenSubject.next(null);
		this.router.navigate(['/auth/login']);
	}

	isAuthenticated(): boolean {
		return !!this.tokenSubject.value;
	}

	getCurrentUser(): UserInfo | null {
		return this.currentUserSubject.value;
	}

	getToken(): string | null {
		return this.tokenSubject.value;
	}

	hasRole(role: string): boolean {
		const user = this.getCurrentUser();
		return user?.userType === role;
	}

	private setAuth(token: string, user: UserInfo): void {
		localStorage.setItem('token', token);
		localStorage.setItem('user', JSON.stringify(user));
		this.tokenSubject.next(token);
		this.currentUserSubject.next(user);
	}

	private loadStoredAuth(): void {
		const token = localStorage.getItem('token');
		const userStr = localStorage.getItem('user');

		if (token && userStr) {
			try {
				const user = JSON.parse(userStr);
				this.tokenSubject.next(token);
				this.currentUserSubject.next(user);
			} catch (error) {
				this.logout();
			}
		}
	}
}