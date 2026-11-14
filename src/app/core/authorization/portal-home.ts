import { AccessIdentity } from './access-control';
import { hasPolicy } from './access-control';

export function portalHomeFor(identity:AccessIdentity|null|undefined):string {
 const roles=identity?.roles??[];
 const hasRole=(role:string)=>roles.some(x=>x.toLowerCase()===role.toLowerCase());
 if(hasRole('Student'))return '/student/dashboard';
 if(hasRole('Teacher'))return '/faculty/dashboard';
 if(['SuperAdmin','DepartmentAdmin','Registrar','FinanceOfficer','HRManager'].some(hasRole))return '/dashboard';
 if(hasPolicy(identity,'Admissions.Staff'))return '/admissions/staff';
 return '/forbidden';
}
