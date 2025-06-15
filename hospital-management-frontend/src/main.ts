// For non-standalone apps, update app.module.ts instead
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
	.catch(err => console.error(err));
