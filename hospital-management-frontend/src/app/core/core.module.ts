import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Import services but don't provide BaseService as it's abstract
import { AuthService } from './services/auth.service';
import { MedicalHistoryService } from './services/medical-history.service';
import { LabReportService } from './services/lab-report.service';

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		HttpClientModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true
		},
		// FIXED: Remove BaseService as it's abstract and cannot be instantiated
		AuthService,
		MedicalHistoryService,
		LabReportService
	]
})
export class CoreModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
		if (parentModule) {
			throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
		}
	}
}
