import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-unauthorized',
	standalone: false,
	templateUrl: './unauthorized.component.html',
	styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent {

	constructor(private router: Router) { }

	goBack(): void {
		this.router.navigate(['/login']);
	}

	goHome(): void {
		this.router.navigate(['/']);
	}
}