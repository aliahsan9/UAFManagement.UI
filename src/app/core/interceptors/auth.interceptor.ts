import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isAuthEndpoint = request.url.includes('/api/v1/auth/');
  const token = auth.accessToken();
  const outgoing = request.clone({
    withCredentials: true,
    ...(token && !isAuthEndpoint ? { setHeaders: { Authorization: `Bearer ${token}` } } : {})
  });
  return next(outgoing).pipe(catchError((error: unknown) => {
    if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint || request.headers.has('X-Retry-After-Refresh')) return throwError(() => error);
    return auth.refresh().pipe(switchMap(ok => {
      if (!ok) return throwError(() => error);
      return next(request.clone({ withCredentials: true, setHeaders: { Authorization: `Bearer ${auth.accessToken()}`, 'X-Retry-After-Refresh': '1' } }));
    }));
  }));
};