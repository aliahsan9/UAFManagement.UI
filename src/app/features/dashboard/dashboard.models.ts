export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StudentSummaryRecord {
  id: string;
  registrationNumber: string;
  fullName: string;
  status: 'Active' | 'Suspended' | 'Graduated' | 'Withdrawn' | number;
}

export interface EmployeeSummaryRecord {
  id: string;
  employeeNumber: string;
  fullName: string;
  status: 'Active' | 'OnLeave' | 'Suspended' | 'Terminated' | number;
}

export interface AcademicProgramSummary {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface AcademicSessionSummary {
  id: string;
  name: string;
  code: string;
  status: 'Planned' | 'Active' | 'Completed' | 'Cancelled' | number;
}

export interface DashboardMetric {
  value: number | null;
  available: boolean;
  description: string;
}

export interface DashboardSummary {
  students: DashboardMetric;
  employees: DashboardMetric;
  programs: DashboardMetric;
  activeSessions: DashboardMetric;
  studentStatuses: { label: string; value: number; color: string }[] | null;
  dataUpdatedAt: Date;
}