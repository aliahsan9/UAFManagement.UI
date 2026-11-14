import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notices = inject(NotificationService);
  const loading = inject(LoadingService);
  loading.begin();
  return next(request).pipe(
    catchError((error: unknown) => {
      const isCredentialForm = /\/api\/v1\/auth\/(login|register)/.test(request.url);
      if (error instanceof HttpErrorResponse && !isCredentialForm) {
        const messages: Record<number,string> = {
          400:'Some information is invalid. Review your input.', 401:'Your session has expired. Sign in again.',
          403:'You do not have permission to perform this action.', 404:'The requested resource was not found.',
          409:'This action conflicts with the current record state.', 429:'Too many requests. Please try again shortly.',
          500:'The server encountered an error. Please try again later.'
        };
        if (error.status === 0) notices.show('Unable to reach the server. Check your connection.', 'error');
        else notices.show(messages[error.status] ?? 'An unexpected error occurred.', 'error');
      }
      return throwError(() => error);
    }),
    finalize(() => loading.end())
  );
};