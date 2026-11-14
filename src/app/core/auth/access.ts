import { CurrentUser } from '../models/auth.models';

const ALL_PERMISSIONS = [
  'admissions.read', 'admissions.review', 'admissions.decide',
  'students.read', 'students.manage',
  'academic-structure.manage', 'academic-catalog.manage', 'course-offerings.manage',
  'finance.read', 'finance.manage', 'employees.manage',
  'attendance.manage', 'attendance-policy.manage',
  'examinations.manage', 'examinations.approve',
  'grading-scales.manage', 'grades.manage', 'course-grades.manage',
  'grade-appeals.review', 'grade-revisions.manage', 'grade-revisions.approve',
  'transcripts.issue', 'timetable.manage', 'workflows.manage',
  'audit-trail.read', 'analytics.read'
] as const;

const REGISTRAR_EXCLUDED = new Set([
  'finance.read', 'finance.manage', 'employees.manage', 'academic-structure.manage', 'audit-trail.read'
]);

/** Mirrors UAF.API PermissionAuthorizationHandler so navigation matches backend roles. */
const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  student: ['admissions.read', 'students.read'],
  teacher: ['students.read', 'attendance.manage', 'examinations.manage', 'grades.manage'],
  registrar: ALL_PERMISSIONS.filter(permission => !REGISTRAR_EXCLUDED.has(permission)),
  departmentadmin: [
    'admissions.read', 'admissions.review', 'students.read', 'students.manage',
    'academic-structure.manage', 'academic-catalog.manage', 'course-offerings.manage',
    'course-grades.manage', 'attendance.manage', 'examinations.manage', 'examinations.approve',
    'grades.manage', 'grade-appeals.review', 'grade-revisions.manage', 'timetable.manage',
    'workflows.manage', 'analytics.read'
  ],
  financeofficer: ['finance.read', 'finance.manage', 'analytics.read'],
  hrmanager: ['employees.manage'],
  superadmin: ALL_PERMISSIONS
};

const POLICY_ALIASES: Record<string, string> = {
  'admissions.staff': 'admissions.review',
  'admissions.decision': 'admissions.decide'
};

export function effectivePermissions(user: CurrentUser | null): Set<string> {
  if (user?.permissions?.length) return new Set(user.permissions.map(permission => permission.toLowerCase()));
  const granted = new Set<string>();
  for (const role of user?.roles ?? []) {
    for (const permission of ROLE_PERMISSIONS[role.toLowerCase()] ?? []) granted.add(permission);
  }
  return granted;
}

export function canAccess(user: CurrentUser | null, required?: readonly string[] | null): boolean {
  if (!required?.length) return true;
  const granted = effectivePermissions(user);
  return required.every(item => {
    const key = item.toLowerCase();
    return granted.has(key) || granted.has(POLICY_ALIASES[key] ?? '');
  });
}

export function roleLabel(role?: string | null): string {
  const labels: Record<string, string> = {
    superadmin: 'Super Admin',
    departmentadmin: 'Department Admin',
    financeofficer: 'Finance Officer',
    hrmanager: 'HR Manager',
    teacher: 'Faculty',
    registrar: 'Registrar',
    student: 'Student'
  };
  if (!role) return 'Portal account';
  return labels[role.toLowerCase()] ?? role;
}
