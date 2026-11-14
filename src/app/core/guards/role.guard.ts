import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = route => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[] | undefined;
  const requiredPermissions = route.data['permissions'] as string[] | undefined;

  const authorize = () => {
    const user = auth.currentUser();
    const roleAllowed = !requiredRoles?.length || requiredRoles.some(role => user?.roles.includes(role));
    const permissionsAllowed = !requiredPermissions?.length ||
      requiredPermissions.every(permission => user?.permissions?.includes(permission));
    return roleAllowed && permissionsAllowed ? true : router.createUrlTree(['/forbidden']);
  };

  if (auth.isAuthenticated()) return authorize();
  return auth.refresh().pipe(map(refreshed => refreshed ? authorize() : router.createUrlTree(['/auth/login'])));
};