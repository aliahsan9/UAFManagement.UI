import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { hasAnyRole, hasPolicy, hasPolicies } from './access-control';

@Injectable({providedIn:'root'})
export class AccessControlService {
 private readonly auth=inject(AuthService);
 readonly identity=this.auth.currentUser;
 readonly isStudent=computed(()=>hasAnyRole(this.identity(),['Student']));
 readonly isTeacher=computed(()=>hasAnyRole(this.identity(),['Teacher']));
 hasPolicy(policy:string):boolean{return hasPolicy(this.identity(),policy);}
 hasPolicies(policies:readonly string[]):boolean{return hasPolicies(this.identity(),policies);}
 hasAnyRole(roles:readonly string[]):boolean{return hasAnyRole(this.identity(),roles);}
}
