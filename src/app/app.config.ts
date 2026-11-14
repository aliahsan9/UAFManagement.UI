import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { correlationIdInterceptor } from './core/interceptors/correlation-id.interceptor';
import { idempotencyInterceptor } from './core/interceptors/idempotency.interceptor';
export const appConfig: ApplicationConfig = { providers: [
 provideBrowserGlobalErrorListeners(),
 provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({scrollPositionRestoration:'top'})),
 provideHttpClient(withInterceptors([correlationIdInterceptor,authInterceptor,idempotencyInterceptor,errorInterceptor]))
] };