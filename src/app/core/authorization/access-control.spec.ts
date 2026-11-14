import { describe,expect,it } from 'vitest';
import { hasAnyRole,hasPolicies,hasPolicy } from './access-control';

describe('backend-aligned portal authorization hints',()=>{
 it('keeps Student access limited to applicant self-service and own academic records',()=>{
  const student={roles:['Student']};
  expect(hasPolicy(student,'Admissions.Applicant')).toBe(true);
  expect(hasPolicy(student,'AcademicRecords.Student')).toBe(true);
  expect(hasPolicy(student,'Students.Management')).toBe(false);
  expect(hasPolicy(student,'Grading.GradeAppealReview')).toBe(false);
 });
 it('maps Teacher to attendance and examination management, not approval',()=>{
  const teacher={roles:['Teacher']};
  expect(hasPolicy(teacher,'Attendance.Management')).toBe(true);
  expect(hasPolicy(teacher,'Examinations.Management')).toBe(true);
  expect(hasPolicy(teacher,'Examinations.Approval')).toBe(false);
  expect(hasPolicy(teacher,'Grading.CourseGradeManagement')).toBe(false);
  expect(hasPolicy(teacher,'Timetable.Management')).toBe(false);
 });
 it('keeps FinanceOfficer and HRManager within their assigned areas',()=>{
  const finance={roles:['FinanceOfficer']};const hr={roles:['HRManager']};
  expect(hasPolicy(finance,'Finance.Management')).toBe(true);
  expect(hasPolicy(finance,'Analytics.Read')).toBe(true);
  expect(hasPolicy(finance,'Employees.Management')).toBe(false);
  expect(hasPolicy(hr,'Employees.Management')).toBe(true);
  expect(hasPolicy(hr,'Finance.Management')).toBe(false);
 });
 it('distinguishes grade revision request management from approval',()=>{
  const departmentAdmin={roles:['DepartmentAdmin']};const registrar={roles:['Registrar']};
  expect(hasPolicy(departmentAdmin,'Grading.GradeRevisionRequestManagement')).toBe(true);
  expect(hasPolicy(departmentAdmin,'Grading.GradeRevisionApproval')).toBe(false);
  expect(hasPolicy(registrar,'Grading.GradeRevisionApproval')).toBe(true);
 });
 it('requires every policy when a route composes multiple backend policies',()=>{
  expect(hasPolicies({roles:['DepartmentAdmin']},['Admissions.Staff','Admissions.Decision'])).toBe(false);
  expect(hasPolicies({roles:['Registrar']},['Admissions.Staff','Admissions.Decision'])).toBe(true);
  expect(hasAnyRole({roles:['FinanceOfficer']},['FinanceOfficer','Registrar'])).toBe(true);
 });
 it('grants SuperAdmin the backend permission set',()=>{
  const root={roles:['SuperAdmin']};
  for(const policy of ['AcademicStructure.Admin','Finance.Management','Employees.Management','Attendance.PolicyManagement','Grading.GradeRevisionApproval','Transcripts.Issuance','Timetable.Management'])expect(hasPolicy(root,policy)).toBe(true);
 });
});
