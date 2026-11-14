import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
export const roleGuard: CanActivateFn = route => {
  const auth = inject(AuthService); const router = inject(Router);
  const allowed = route.data['roles'] as string[] | undefined;
  const check = () => !allowed?.length || allowed.some(role => auth.currentUser()?.roles.includes(role))
    ? true : router.createUrlTree(['/forbidden']);
  if (auth.isAuthenticated()) return check();
  return auth.refresh().pipe(map(ok => ok ? check() : router.createUrlTree(['/auth/login'])));
};