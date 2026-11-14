import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
const AUTH_RETRY = new HttpContextToken<boolean>(() => false);
const AUTH_EXEMPT = ['/api/v1/auth/login','/api/v1/auth/register','/api/v1/auth/refresh','/api/v1/auth/revoke'];
export const authInterceptor: HttpInterceptorFn = (request, next) => {
 const auth=inject(AuthService);const router=inject(Router);const exempt=AUTH_EXEMPT.some(path=>request.url.includes(path));const token=auth.accessToken();
 const outgoing=request.clone({withCredentials:true,...(token&&!exempt?{setHeaders:{Authorization:'Bearer '+token}}:{})});
 return next(outgoing).pipe(catchError((error:unknown)=>{
  if(!(error instanceof HttpErrorResponse)||error.status!==401||exempt||request.context.get(AUTH_RETRY))return throwError(()=>error);
  return auth.refresh().pipe(switchMap(refreshed=>{
   if(!refreshed){if(!router.url.startsWith('/auth/'))void router.navigate(['/auth/login'],{queryParams:{returnUrl:router.url}});return throwError(()=>error);}
   return next(request.clone({withCredentials:true,context:request.context.set(AUTH_RETRY,true),setHeaders:{Authorization:'Bearer '+auth.accessToken()}}));
  }));
 }));
};
