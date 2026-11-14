import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DashboardService } from './dashboard.service';
import { environment } from '../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('aggregates dashboard counts from the existing API resources', () => {
    let summary: any;
    service.getSummary().subscribe(value => summary = value);

    const requests = http.match(request => request.url.startsWith(environment.apiBaseUrl));
    expect(requests).toHaveLength(9);

    for (const request of requests) {
      if (request.request.url.endsWith('/students/') || request.request.url.endsWith('/employees/')) {
        const status = request.request.params.get('status');
        const isEmployee = request.request.url.endsWith('/employees/');
        const totalCount = isEmployee ? (status === 'Active' ? 4 : 5) :
          status === 'Active' ? 8 : status === 'Suspended' ? 1 : status === 'Graduated' ? 2 : status === 'Withdrawn' ? 1 : 12;
        request.flush({ items: [], page: 1, pageSize: 1, totalCount, totalPages: totalCount });
      } else if (request.request.url.endsWith('/academic-structure/programs')) {
        request.flush([{ id: 'p1', name: 'Computer Science', code: 'CS', isActive: true }]);
      } else if (request.request.url.endsWith('/academic-sessions/')) {
        request.flush([{ id: 's1', name: 'Fall 2026', code: 'F26', status: 'Active' }]);
      }
    }

    expect(summary.students.value).toBe(12);
    expect(summary.employees.value).toBe(12);
    expect(summary.programs.value).toBe(1);
    expect(summary.activeSessions.value).toBe(1);
    expect(summary.studentStatuses).toHaveLength(4);
    expect(summary.studentStatuses.reduce((total: number, item: any) => total + item.value, 0)).toBe(12);
  });

  it('marks unavailable resources instead of displaying fabricated zero values', () => {
    let summary: any;
    service.getSummary().subscribe(value => summary = value);

    const requests = http.match(request => request.url.startsWith(environment.apiBaseUrl));
    for (const request of requests) request.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(summary.students.value).toBeNull();
    expect(summary.students.available).toBe(false);
    expect(summary.programs.value).toBeNull();
    expect(summary.studentStatuses).toBeNull();
  });
});