import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthCheckReportDto } from '../models/api.models';
export interface HealthSnapshot extends HealthCheckReportDto { endpoint: 'live' | 'ready' | 'aggregate'; httpStatus: number; reachable: boolean; healthy: boolean; }
@Injectable({ providedIn: 'root' })
export class SystemHealthService {
 private readonly http = inject(HttpClient); private readonly base = environment.apiBaseUrl.replace(/\\/$/, '');
 check(endpoint: HealthSnapshot['endpoint']): Observable<HealthSnapshot> {
  const path = endpoint === 'live' ? '/health/live' : endpoint === 'ready' ? '/health/ready' : '/health';
  return this.http.get<HealthCheckReportDto>(this.base + path, { withCredentials: true, observe: 'response' }).pipe(
   map(response => this.normalize(endpoint, response.body ?? { status: 'Unknown', checks: [] }, response.status, true)),
   catchError((error: unknown) => { if (error instanceof HttpErrorResponse && error.status === 503 && error.error && typeof error.error === 'object') return of(this.normalize(endpoint, error.error as HealthCheckReportDto, 503, true)); const status = error instanceof HttpErrorResponse ? error.status : 0; return of(this.normalize(endpoint, { status: 'Unreachable', checks: [] }, status, false)); })
  );
 }
 private normalize(endpoint: HealthSnapshot['endpoint'], report: HealthCheckReportDto, httpStatus: number, reachable: boolean): HealthSnapshot { const status = report.status ?? 'Unknown'; return { endpoint, status, checks: report.checks ?? [], httpStatus, reachable, healthy: reachable && status.toLowerCase() === 'healthy' }; }
}
