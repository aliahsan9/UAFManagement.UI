import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('renders live API totals instead of demo figures', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: signal({ fullName: 'Ayesha Khan', email: 'ayesha@uaf.edu.pk', roles: ['SuperAdmin'] }) } }
      ]
    });

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const requests = http.match(request => request.url.startsWith(environment.apiBaseUrl));

    for (const request of requests) {
      if (request.request.url.includes('/analytics/dashboard')) {
        request.flush({
          generatedAtUtc: '2026-11-14T10:00:00Z',
          students: { total: 3, active: 2 },
          admissions: { total: 4, pending: 1 },
          activeAcademicSessions: 1,
          finance: { outstandingBalance: 1500, currency: 'PKR' }
        });
      } else if (request.request.url.includes('/notifications/')) {
        request.flush([]);
      } else if (request.request.url.includes('/audit-trail')) {
        request.flush([]);
      } else if (request.request.url.endsWith('/students/') || request.request.url.endsWith('/employees/')) {
        request.flush({ items: [], page: 1, pageSize: 1, totalCount: request.request.url.endsWith('/employees/') ? 7 : 3, totalPages: 1 });
      } else if (request.request.url.endsWith('/academic-structure/programs')) {
        request.flush([{ id: 'p1', name: 'Agronomy', code: 'AGR', isActive: true }]);
      } else if (request.request.url.endsWith('/academic-sessions/')) {
        request.flush([{ id: 's1', name: 'Fall 2026', code: 'F26', status: 'Active' }]);
      } else {
        request.flush([]);
      }
    }

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ayesha Khan');
    expect(text).toContain('3');
    expect(text).toContain('7');
    expect(text).not.toContain('12,480');
    expect(text).not.toContain('Muhammad Hassan');
    expect(text).toContain('1,500');
  });
});
