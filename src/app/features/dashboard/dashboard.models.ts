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
  activeStudentCount: number | null;
  activeEmployeeCount: number | null;
  activeProgramCount: number | null;
  studentStatuses: { label: string; value: number; color: string }[] | null;
  dataUpdatedAt: Date;
}

export interface DashboardAnalytics {
  generatedAtUtc: string;
  students: { total: number; active: number };
  admissions: { total: number; pending: number };
  activeAcademicSessions: number;
  finance: { outstandingBalance: number; currency: string };
}

export interface DashboardNotice {
  id: string;
  title: string;
  message: string;
  channel: number | string;
  status: number | string;
  createdAtUtc: string;
  readAtUtc: string | null;
}

export interface DashboardActivity {
  id: string;
  action: string;
  entityType: string;
  occurredAtUtc: string;
}