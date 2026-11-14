import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { IDEMPOTENCY_KEY } from '../http/http-context.tokens';
export const idempotencyInterceptor:HttpInterceptorFn=(request,next)=>{const key=request.context.get(IDEMPOTENCY_KEY);if(!key)return next(request);const valid=key.length>=1&&key.length<=128&&Array.from(key).every(char=>{const code=char.charCodeAt(0);return code>=32&&code<=126;});if(!valid)return throwError(()=>new Error('Idempotency keys must contain 1-128 printable ASCII characters.'));return next(request.clone({setHeaders:{'Idempotency-Key':key}}));};
