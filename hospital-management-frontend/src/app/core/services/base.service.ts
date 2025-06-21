import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export abstract class BaseService {

	protected handleError(error: any): Observable<never> {
		console.error('Service Error:', error);

		let errorMessage = 'An unexpected error occurred';

		if (error.error?.message) {
			errorMessage = error.error.message;
		} else if (error.message) {
			errorMessage = error.message;
		} else if (typeof error.error === 'string') {
			errorMessage = error.error;
		}

		return throwError(() => new Error(errorMessage));
	}
}
