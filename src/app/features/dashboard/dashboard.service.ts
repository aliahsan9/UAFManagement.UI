import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AcademicProgramSummary, AcademicSessionSummary, DashboardActivity, DashboardAnalytics,
  DashboardMetric, DashboardNotice, DashboardSummary, EmployeeSummaryRecord, PagedResult, StudentSummaryRecord
} from './dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  getSummary(): Observable<DashboardSummary> {
    const students = this.getCount<PagedResult<StudentSummaryRecord>>('/api/v1/students/', {
      page: 1, pageSize: 1
    });
    const activeStudents = this.getCount<PagedResult<StudentSummaryRecord>>('/api/v1/students/', {
      page: 1, pageSize: 1, status: 'Active'
    });
    const suspendedStudents = this.getCount<PagedResult<StudentSummaryRecord>>('/api/v1/students/', {
      page: 1, pageSize: 1, status: 'Suspended'
    });
    const graduatedStudents = this.getCount<PagedResult<StudentSummaryRecord>>('/api/v1/students/', {
      page: 1, pageSize: 1, status: 'Graduated'
    });
    const withdrawnStudents = this.getCount<PagedResult<StudentSummaryRecord>>('/api/v1/students/', {
      page: 1, pageSize: 1, status: 'Withdrawn'
    });
    const employees = this.getCount<PagedResult<EmployeeSummaryRecord>>('/api/v1/employees/', {
      page: 1, pageSize: 1
    });
    const activeEmployees = this.getCount<PagedResult<EmployeeSummaryRecord>>('/api/v1/employees/', {
      page: 1, pageSize: 1, status: 'Active'
    });
    const programs = this.getList<AcademicProgramSummary[]>('/api/v1/academic-structure/programs');
    const sessions = this.getList<AcademicSessionSummary[]>('/api/v1/academic-sessions/');

    return forkJoin({
      students, activeStudents, suspendedStudents, graduatedStudents, withdrawnStudents,
      employees, activeEmployees, programs, sessions
    }).pipe(map(result => {
      const studentStatuses = result.activeStudents !== null &&
        result.suspendedStudents !== null && result.graduatedStudents !== null &&
        result.withdrawnStudents !== null
        ? [
            { label: 'Active', value: result.activeStudents, color: '#2f9875' },
            { label: 'Suspended', value: result.suspendedStudents, color: '#d69a45' },
            { label: 'Graduated', value: result.graduatedStudents, color: '#6289bd' },
            { label: 'Withdrawn', value: result.withdrawnStudents, color: '#c7777b' }
          ]
        : null;

      return {
        students: this.metric(result.students, 'Registered student records'),
        employees: this.metric(result.employees, 'University employee records'),
        programs: this.metric(result.programs?.length ?? null, 'Academic programs'),
        activeSessions: this.metric(
          result.sessions?.filter(session => session.status === 'Active' || session.status === 2).length ?? null,
          'Currently active academic sessions'
        ),
        activeStudentCount: result.activeStudents,
        activeEmployeeCount: result.activeEmployees,
        activeProgramCount: result.programs ? result.programs.filter(program => program.isActive).length : null,
        studentStatuses,
        dataUpdatedAt: new Date()
      };
    }));
  }

  private getCount<T extends { totalCount: number }>(
    path: string, query: Record<string, string | number>
  ): Observable<number | null> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) params = params.set(key, String(value));
    return this.http.get<T>(`${this.api}${path}`, { params }).pipe(
      map(response => response.totalCount),
      catchError(() => of(null))
    );
  }

  private getList<T>(path: string): Observable<T | null> {
    return this.http.get<T>(`${this.api}${path}`).pipe(catchError(() => of(null)));
  }

  getAnalytics(): Observable<DashboardAnalytics | null> {
    return this.http.get<DashboardAnalytics>(`${this.api}/api/v1/analytics/dashboard`).pipe(catchError(() => of(null)));
  }

  getNotices(): Observable<DashboardNotice[] | null> {
    const params = new HttpParams().set('page', '1').set('pageSize', '4');
    return this.http.get<DashboardNotice[]>(`${this.api}/api/v1/notifications/`, { params }).pipe(catchError(() => of(null)));
  }

  getActivity(): Observable<DashboardActivity[] | null> {
    const params = new HttpParams().set('page', '1').set('pageSize', '4');
    return this.http.get<DashboardActivity[]>(`${this.api}/api/v1/audit-trail`, { params }).pipe(catchError(() => of(null)));
  }

  markNoticeRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/api/v1/notifications/${id}/read`, {});
  }

  private metric(value: number | null, description: string): DashboardMetric {
    return { value, available: value !== null, description };
  }
}