/** Client-side mirror of the backend PermissionAuthorizationHandler.
 * Used only for navigation and route UX. The API remains the authorization boundary.
 */
export const UAF_PERMISSIONS = [
 'admissions.read','admissions.review','admissions.decide','students.read','students.manage',
 'academic-structure.manage','academic-catalog.manage','course-offerings.manage','finance.read',
 'finance.manage','employees.manage','attendance.manage','attendance-policy.manage',
 'examinations.manage','examinations.approve','grading-scales.manage','grades.manage',
 'course-grades.manage','grade-appeals.review','grade-revisions.manage','grade-revisions.approve',
 'transcripts.issue','timetable.manage','workflows.manage','audit-trail.read','analytics.read'
] as const;

export const ROLE_PERMISSIONS: Readonly<Record<string, readonly string[]>> = {
 Student:['admissions.read','students.read'],
 Teacher:['students.read','attendance.manage','examinations.manage','grades.manage'],
 Registrar:UAF_PERMISSIONS.filter(p=>!['finance.read','finance.manage','employees.manage','academic-structure.manage','audit-trail.read'].includes(p)),
 DepartmentAdmin:['admissions.read','admissions.review','students.read','students.manage','academic-structure.manage','academic-catalog.manage','course-offerings.manage','course-grades.manage','attendance.manage','examinations.manage','examinations.approve','grades.manage','grade-appeals.review','grade-revisions.manage','timetable.manage','workflows.manage','analytics.read'],
 FinanceOfficer:['finance.read','finance.manage','analytics.read'],
 HRManager:['employees.manage'],
 SuperAdmin:UAF_PERMISSIONS
};

export const POLICY_PERMISSION: Readonly<Record<string,string>> = {
 'Admissions.Staff':'admissions.review',
 'Admissions.Decision':'admissions.decide',
 'AcademicStructure.Admin':'academic-structure.manage',
 'Students.Management':'students.manage',
 'AcademicCatalog.Management':'academic-catalog.manage',
 'CourseOfferings.Management':'course-offerings.manage',
 'Finance.Management':'finance.manage',
 'Employees.Management':'employees.manage',
 'Attendance.Management':'attendance.manage',
 'Attendance.PolicyManagement':'attendance-policy.manage',
 'Examinations.Management':'examinations.manage',
 'Examinations.Approval':'examinations.approve',
 'Grading.ScaleManagement':'grading-scales.manage',
 'Grading.CourseGradeManagement':'course-grades.manage',
 'Grading.GradeAppealReview':'grade-appeals.review',
 'Grading.GradeRevisionRequestManagement':'grade-revisions.manage',
 'Grading.GradeRevisionApproval':'grade-revisions.approve',
 'Transcripts.Issuance':'transcripts.issue',
 'Timetable.Management':'timetable.manage',
 'Analytics.Read':'analytics.read',
 'Workflows.Management':'workflows.manage',
 'AuditTrail.Read':'audit-trail.read'
};

export const POLICY_ROLE: Readonly<Record<string,string>> = {
 'Admissions.Applicant':'Student',
 'AcademicRecords.Student':'Student'
};

export interface AccessIdentity { roles?: readonly string[] | null; permissions?: readonly string[] | null; }

export function effectivePermissions(identity: AccessIdentity | null | undefined): ReadonlySet<string> {
 const result = new Set<string>(identity?.permissions ?? []);
 for (const role of identity?.roles ?? []) {
  for (const permission of ROLE_PERMISSIONS[role] ?? []) result.add(permission);
 }
 return result;
}

export function hasPolicy(identity: AccessIdentity | null | undefined, policy: string): boolean {
 const requiredRole=POLICY_ROLE[policy];
 if(requiredRole) return (identity?.roles ?? []).some(role=>role.toLowerCase()===requiredRole.toLowerCase());
 const permission=POLICY_PERMISSION[policy] ?? policy;
 return effectivePermissions(identity).has(permission);
}

export function hasPolicies(identity: AccessIdentity | null | undefined, policies: readonly string[] | null | undefined): boolean {
 return !policies?.length || policies.every(policy=>hasPolicy(identity,policy));
}

export function hasAnyRole(identity: AccessIdentity | null | undefined, roles: readonly string[] | null | undefined): boolean {
 return !roles?.length || (identity?.roles ?? []).some(role=>roles.some(required=>required.toLowerCase()===role.toLowerCase()));
}
