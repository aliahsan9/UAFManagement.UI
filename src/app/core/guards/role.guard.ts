import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { hasAnyRole,hasPolicies } from '../authorization/access-control';

export const roleGuard: CanActivateFn = route => {
 const auth=inject(AuthService);const router=inject(Router);
 const requiredRoles=route.data['roles'] as string[]|undefined;
 const requiredPolicies=(route.data['policies']??route.data['permissions']) as string[]|undefined;
 const authorize=()=>{
  const user=auth.currentUser();
  const roleAllowed=hasAnyRole(user,requiredRoles);
  const policiesAllowed=hasPolicies(user,requiredPolicies);
  return roleAllowed&&policiesAllowed?true:router.createUrlTree(['/forbidden']);
 };
 if(auth.isAuthenticated())return authorize();
 return auth.refresh().pipe(map(refreshed=>refreshed?authorize():router.createUrlTree(['/auth/login'])));
};
