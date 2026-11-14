import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/auth`;
  private readonly tokenState = signal<string | null>(null);
  private readonly userState = signal<CurrentUser | null>(null);
  private refreshRequest$?: Observable<boolean>;
  readonly accessToken = this.tokenState.asReadonly();
  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenState());

  login(body: LoginRequest): Observable<CurrentUser> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, body).pipe(tap(x => this.accept(x)), switchMap(x => this.loadMe(x)));
  }
  register(body: RegisterRequest): Observable<CurrentUser> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, body).pipe(tap(x => this.accept(x)), switchMap(x => this.loadMe(x)));
  }
  refresh(): Observable<boolean> {
    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, {}, {
        withCredentials: true, headers: { 'X-Refresh-Request': '1' }
      }).pipe(
        tap(x => this.accept(x)), map(() => true),
        catchError(() => { this.clearSession(); return of(false); }),
        finalize(() => { this.refreshRequest$ = undefined; }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.refreshRequest$;
  }
  revoke(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/revoke`, {}, {
      withCredentials: true, headers: { 'X-Refresh-Request': '1' }
    }).pipe(finalize(() => this.clearSession()));
  }
  logout(): Observable<void> {
    if (!this.tokenState()) { this.clearSession(); return of(void 0); }
    return this.revoke().pipe(catchError(() => { this.clearSession(); return of(void 0); }));
  }
  clearSession(): void { this.tokenState.set(null); this.userState.set(null); }
  private accept(x: AuthResponse): void {
    this.tokenState.set(x.accessToken);
    this.userState.set({ userId: x.userId, fullName: x.email.split('@')[0], email: x.email, roles: x.roles ?? [] });
  }
  private loadMe(x: AuthResponse): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.baseUrl}/me`).pipe(
      tap(user => this.userState.set(user)),
      catchError(() => {
        const fallback: CurrentUser = { userId: x.userId, fullName: x.email.split('@')[0], email: x.email, roles: x.roles ?? [] };
        this.userState.set(fallback); return of(fallback);
      })
    );
  }
}