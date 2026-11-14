import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AcademicSession, AcademicSessionRequest, AcademicSessionStatus, Course,
  CreateCourseRequest, UpdateCourseRequest
} from './academic-catalog.models';

@Injectable({ providedIn: 'root' })
export class AcademicCatalogService {
  private readonly http = inject(HttpClient);
  private readonly sessionsUrl = environment.apiBaseUrl + '/api/v1/academic-sessions/';
  private readonly coursesUrl = environment.apiBaseUrl + '/api/v1/courses/';

  getSessions(status?: AcademicSessionStatus): Observable<AcademicSession[]> {
    let params = new HttpParams();
    if (status !== undefined) params = params.set('status', String(status));
    return this.http.get<AcademicSession[]>(this.sessionsUrl, { params });
  }

  getSession(id: string): Observable<AcademicSession> {
    return this.http.get<AcademicSession>(this.sessionsUrl + encodeURIComponent(id));
  }

  createSession(request: AcademicSessionRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.sessionsUrl, request);
  }

  updateSession(id: string, request: AcademicSessionRequest): Observable<void> {
    return this.http.put<void>(this.sessionsUrl + encodeURIComponent(id), request);
  }

  activateSession(id: string): Observable<void> {
    return this.http.post<void>(this.sessionsUrl + encodeURIComponent(id) + '/activate', null);
  }

  completeSession(id: string): Observable<void> {
    return this.http.post<void>(this.sessionsUrl + encodeURIComponent(id) + '/complete', null);
  }

  cancelSession(id: string): Observable<void> {
    return this.http.post<void>(this.sessionsUrl + encodeURIComponent(id) + '/cancel', null);
  }

  getCourses(filters: { departmentId?: string; isActive?: boolean } = {}): Observable<Course[]> {
    let params = new HttpParams();
    if (filters.departmentId) params = params.set('departmentId', filters.departmentId);
    if (filters.isActive !== undefined) params = params.set('isActive', String(filters.isActive));
    return this.http.get<Course[]>(this.coursesUrl, { params });
  }

  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(this.coursesUrl + encodeURIComponent(id));
  }

  createCourse(request: CreateCourseRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.coursesUrl, request);
  }

  updateCourse(id: string, request: UpdateCourseRequest): Observable<void> {
    return this.http.put<void>(this.coursesUrl + encodeURIComponent(id), request);
  }

  deactivateCourse(id: string): Observable<void> {
    return this.http.delete<void>(this.coursesUrl + encodeURIComponent(id));
  }

  reactivateCourse(id: string): Observable<void> {
    return this.http.post<void>(this.coursesUrl + encodeURIComponent(id) + '/reactivate', null);
  }
}
