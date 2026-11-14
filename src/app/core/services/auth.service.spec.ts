import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const baseUrl = 'https://localhost:7043/api/v1/auth';
  const authResponse = {
    accessToken: 'access-token',
    expiresAtUtc: '2026-12-01T00:00:00Z',
    userId: 'user-1',
    email: 'student@uaf.edu.pk',
    roles: ['Student']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('keeps access token in memory and loads the current user after login', () => {
    let resolvedEmail = '';
    service.login({ email: 'student@uaf.edu.pk', password: 'Password123!' }).subscribe(user => {
      resolvedEmail = user.email;
    });

    const login = http.expectOne(`${baseUrl}/login`);
    expect(login.request.method).toBe('POST');
    login.flush(authResponse);

    const me = http.expectOne(`${baseUrl}/me`);
    expect(me.request.headers.get('Authorization')).toBe('Bearer access-token');
    me.flush({ userId: 'user-1', fullName: 'UAF Student', email: 'student@uaf.edu.pk', roles: ['Student'] });

    expect(service.accessToken()).toBe('access-token');
    expect(service.currentUser()?.fullName).toBe('UAF Student');
    expect(resolvedEmail).toBe('student@uaf.edu.pk');
  });

  it('sends the refresh marker and credentials when refreshing the session', () => {
    let refreshed = false;
    service.refresh().subscribe(value => refreshed = value);

    const request = http.expectOne(`${baseUrl}/refresh`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-Refresh-Request')).toBe('1');
    request.flush(authResponse);

    expect(refreshed).toBe(true);
    expect(service.accessToken()).toBe('access-token');
  });

  it('shares one refresh request between concurrent callers', () => {
    const values: boolean[] = [];
    service.refresh().subscribe(value => values.push(value));
    service.refresh().subscribe(value => values.push(value));

    const request = http.expectOne(`${baseUrl}/refresh`);
    request.flush(authResponse);

    expect(values).toEqual([true, true]);
    http.expectNone(`${baseUrl}/refresh`);
  });
});