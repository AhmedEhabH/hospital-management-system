import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ThemeService {
	private isDarkModeSubject = new BehaviorSubject<boolean>(false);
	public isDarkMode$ = this.isDarkModeSubject.asObservable();

	constructor() {
		this.loadTheme();
	}

	toggleTheme(): void {
		const isDark = !this.isDarkModeSubject.value;
		this.isDarkModeSubject.next(isDark);
		this.applyTheme(isDark);
		localStorage.setItem('darkMode', isDark.toString());
	}

	private loadTheme(): void {
		const savedTheme = localStorage.getItem('darkMode');
		const isDark = savedTheme ? JSON.parse(savedTheme) : false;
		this.isDarkModeSubject.next(isDark);
		this.applyTheme(isDark);
	}

	private applyTheme(isDark: boolean): void {
		const body = document.body;
		if (isDark) {
			body.classList.add('dark-theme');
			body.classList.remove('light-theme');
		} else {
			body.classList.add('light-theme');
			body.classList.remove('dark-theme');
		}
	}

	getCurrentTheme(): boolean {
		return this.isDarkModeSubject.value;
	}
}
