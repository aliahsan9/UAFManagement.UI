import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { CorrelationIdService } from '../services/correlation-id.service';
export const correlationIdInterceptor: HttpInterceptorFn = (request, next) => { const correlation = inject(CorrelationIdService); const id = request.headers.get('X-Correlation-ID') ?? correlation.create(); return next(request.clone({ setHeaders: { 'X-Correlation-ID': id } })).pipe(tap(event => { if (event instanceof HttpResponse) correlation.capture(event.headers.get('X-Correlation-ID') ?? id); }), catchError((error: unknown) => { if (error instanceof HttpErrorResponse) correlation.capture(error.headers.get('X-Correlation-ID') ?? id); return throwError(() => error); })); };
