import {describe,expect,it} from 'vitest';
import {portalHomeFor} from './portal-home';
describe('role-specific portal landing',()=>{
 it('routes student and teacher accounts to their own workspaces',()=>{
  expect(portalHomeFor({roles:['Student']})).toBe('/student/dashboard');
  expect(portalHomeFor({roles:['Teacher']})).toBe('/faculty/dashboard');
 });
 it('routes university administration roles to administration',()=>{
  for(const role of ['SuperAdmin','DepartmentAdmin','Registrar','FinanceOfficer','HRManager'])expect(portalHomeFor({roles:[role]})).toBe('/dashboard');
 });
 it('routes admissions-only staff to admissions portal',()=>expect(portalHomeFor({roles:['AdmissionsOfficer'],permissions:['admissions.review']})).toBe('/admissions/staff'));
 it('does not invent a default portal for unknown roles',()=>expect(portalHomeFor({roles:['Unknown']})).toBe('/forbidden'));
});
