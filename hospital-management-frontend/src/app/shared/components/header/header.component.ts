import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-header',
	standalone:false,
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	currentUser: any = null;

	constructor(private authService: AuthService) { }

	ngOnInit(): void {
		this.authService.currentUser$
			.pipe(takeUntil(this.destroy$))
			.subscribe(user => {
				this.currentUser = user;
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
