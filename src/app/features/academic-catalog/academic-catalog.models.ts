export enum AcademicSessionStatus {
  Planned = 1,
  Active = 2,
  Completed = 3,
  Cancelled = 4
}

export interface AcademicSession {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: AcademicSessionStatus | number | string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface AcademicSessionRequest {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
}

export interface Course {
  id: string;
  departmentId: string;
  code: string;
  title: string;
  creditHours: number;
  description: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface CreateCourseRequest {
  departmentId: string;
  code: string;
  title: string;
  creditHours: number;
  description: string | null;
}

export interface UpdateCourseRequest {
  code: string;
  title: string;
  creditHours: number;
  description: string | null;
}

export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  facultyId: string;
}

export const SESSION_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: AcademicSessionStatus.Planned, label: 'Planned' },
  { value: AcademicSessionStatus.Active, label: 'Active' },
  { value: AcademicSessionStatus.Completed, label: 'Completed' },
  { value: AcademicSessionStatus.Cancelled, label: 'Cancelled' }
] as const;

export function sessionStatusValue(value: AcademicSession['status']): AcademicSessionStatus {
  if (typeof value === 'number') return value as AcademicSessionStatus;
  const normalized = String(value).toLowerCase();
  if (normalized === 'planned' || normalized === '1') return AcademicSessionStatus.Planned;
  if (normalized === 'active' || normalized === '2') return AcademicSessionStatus.Active;
  if (normalized === 'completed' || normalized === '3') return AcademicSessionStatus.Completed;
  if (normalized === 'cancelled' || normalized === 'canceled' || normalized === '4') return AcademicSessionStatus.Cancelled;
  return AcademicSessionStatus.Planned;
}

export function sessionStatusLabel(value: AcademicSession['status']): string {
  return ({
    [AcademicSessionStatus.Planned]: 'Planned',
    [AcademicSessionStatus.Active]: 'Active',
    [AcademicSessionStatus.Completed]: 'Completed',
    [AcademicSessionStatus.Cancelled]: 'Cancelled'
  } as Record<number, string>)[sessionStatusValue(value)];
}

export function sessionStatusClass(value: AcademicSession['status']): string {
  return ({
    [AcademicSessionStatus.Planned]: 'text-bg-primary',
    [AcademicSessionStatus.Active]: 'text-bg-success',
    [AcademicSessionStatus.Completed]: 'text-bg-secondary',
    [AcademicSessionStatus.Cancelled]: 'text-bg-danger'
  } as Record<number, string>)[sessionStatusValue(value)];
}
