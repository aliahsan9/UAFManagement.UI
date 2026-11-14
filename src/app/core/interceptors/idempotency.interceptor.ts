import { HttpInterceptorFn } from '@angular/common/http';
import { IDEMPOTENCY_KEY } from '../http/http-context.tokens';
export const idempotencyInterceptor: HttpInterceptorFn = (request, next) => { const key = request.context.get(IDEMPOTENCY_KEY); if (!key) return next(request); if (!/^[\\x20-\\x7E]{1,128}$/.test(key)) throw new Error('Idempotency keys must contain 1-128 printable ASCII characters.'); return next(request.clone({ setHeaders: { 'Idempotency-Key': key } })); };
