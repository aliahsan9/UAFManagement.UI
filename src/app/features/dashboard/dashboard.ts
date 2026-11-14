import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from './dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="dashboard-page">
      <header class="dashboard-page__heading">
        <div>
          <span class="eyebrow">UNIVERSITY OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Your institution at a glance. Live figures are loaded from authorized UAF API resources.</p>
        </div>
        <button class="dashboard-refresh" type="button" (click)="refresh()" [disabled]="loading()">
          <span [class.refresh-spin]="loading()">↻</span> Refresh data
        </button>
      </header>

      @if (error()) {
        <div class="dashboard-alert" role="alert">
          <span>!</span><div><strong>Dashboard data could not be loaded.</strong><p>{{error()}}</p></div>
          <button type="button" (click)="refresh()">Try again</button>
        </div>
      }

      <section class="dashboard-stat-grid" aria-label="University statistics">
        @for (card of statCards; track card.key) {
          <article class="dashboard-stat-card">
            <div class="dashboard-stat-card__top">
              <span class="dashboard-stat-card__label">{{card.label}}</span>
              <span class="dashboard-stat-card__icon" [class]="card.iconClass">{{card.icon}}</span>
            </div>
            <strong class="dashboard-stat-card__value">
              @if (loading()) { <span class="stat-skeleton"></span> }
              @else if (summary()?.[card.key]?.available) { {{summary()?.[card.key]?.value | number}} }
              @else { <span class="stat-unavailable">—</span> }
            </strong>
            <span class="dashboard-stat-card__description">
              {{summary()?.[card.key]?.description ?? card.fallback}}
            </span>
            @if (!loading() && summary() && !summary()![card.key].available) {
              <span class="data-unavailable">Not available for this account</span>
            }
          </article>
        }
      </section>

      <section class="dashboard-main-grid">
        <article class="dashboard-panel enrollment-panel">
          <div class="dashboard-panel__heading">
            <div><span class="eyebrow">STUDENT RECORDS</span><h2>Enrollment overview</h2><p>Current student distribution by academic standing</p></div>
            <span class="panel-period">Current records</span>
          </div>
          @if (loading()) {
            <div class="chart-loading"><span class="stat-skeleton"></span><span class="stat-skeleton"></span><span class="stat-skeleton"></span></div>
          } @else if (summary()?.studentStatuses; as statuses) {
            <div class="enrollment-total"><strong>{{ summary()?.students?.value === null || summary()?.students?.value === undefined ? '—' : (summary()?.students?.value | number) }}</strong><span>total student records</span></div>
            <div class="status-bars">
              @for (item of statuses; track item.label) {
                <div class="status-bar-row">
                  <div class="status-bar-row__meta"><span><i [style.background]="item.color"></i>{{item.label}}</span><strong>{{item.value | number}}</strong></div>
                  <div class="status-bar-track"><span [style.width.%]="percentage(item.value)" [style.background]="item.color"></span></div>
                </div>
              }
            </div>
          } @else {
            <div class="dashboard-empty"><span>—</span><strong>Student breakdown unavailable</strong><p>The current account cannot access the student status endpoints, or the API is unavailable.</p></div>
          }
          <div class="panel-footnote">Counts are derived from the Students API. This is a current-state snapshot, not a historical trend.</div>
        </article>

        <article class="dashboard-panel admission-panel">
          <div class="dashboard-panel__heading">
            <div><span class="eyebrow">ADMISSIONS</span><h2>Admission pipeline</h2><p>Application progress and pending decisions</p></div>
            <span class="panel-icon panel-icon--blue">↗</span>
          </div>
          <div class="dashboard-empty dashboard-empty--compact">
            <span>◷</span><strong>Admission analytics are not exposed yet</strong>
            <p>The backend supports admission decisions and audit history, but does not currently expose a staff-wide application list or aggregate statistics endpoint.</p>
          </div>
          <div class="panel-footnote">No estimated totals or fabricated chart values are shown.</div>
        </article>
      </section>

      <section class="dashboard-lower-grid">
        <article class="dashboard-panel">
          <div class="dashboard-panel__heading">
            <div><span class="eyebrow">OPERATIONS</span><h2>University activity</h2><p>Recent events across the institution</p></div>
          </div>
          <div class="dashboard-empty dashboard-empty--compact">
            <span>⌁</span><strong>Activity feed is not available</strong>
            <p>The API does not currently provide a consolidated recent-activity feed for dashboard consumption.</p>
          </div>
        </article>
        <article class="dashboard-panel">
          <div class="dashboard-panel__heading">
            <div><span class="eyebrow">QUICK ACCESS</span><h2>University modules</h2><p>Core areas available through the API</p></div>
          </div>
          <div class="dashboard-quick-links">
            <div class="quick-link-row"><span class="quick-link-icon quick-link-icon--blue">S</span><span><strong>Students</strong><small>Student records API</small></span><b>Available</b></div>
            <div class="quick-link-row"><span class="quick-link-icon quick-link-icon--violet">A</span><span><strong>Academic catalog</strong><small>Programs and sessions API</small></span><b>Available</b></div>
            <div class="quick-link-row"><span class="quick-link-icon quick-link-icon--green">E</span><span><strong>Employees</strong><small>Employee records API</small></span><b>Available</b></div>
          </div>
          <div class="panel-footnote">Dedicated module pages will be introduced in their respective phases.</div>
        </article>
      </section>

      <section class="dashboard-capability-grid">
        <article class="capability-card"><span class="capability-icon">₨</span><div><strong>Finance overview</strong><p>No finance-wide totals endpoint exists yet. The current API exposes individual student fee accounts and payment operations.</p></div><span class="capability-status">API gap</span></article>
        <article class="capability-card"><span class="capability-icon">✓</span><div><strong>Attendance overview</strong><p>Attendance reports are available per course offering. A university-wide attendance aggregate is not currently exposed.</p></div><span class="capability-status">API gap</span></article>
      </section>

      <footer class="dashboard-data-footer">
        <span>UAF Management System <i></i> Administrative overview</span>
        <span>{{updatedAt()}}</span>
      </footer>
    </section>
  `
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly updatedAt = signal('Waiting for API data');

  readonly statCards = [
    { key: 'students', label: 'Total students', fallback: 'Registered student records', icon: 'S', iconClass: 'stat-icon--blue' },
    { key: 'employees', label: 'Total employees', fallback: 'University employee records', icon: 'E', iconClass: 'stat-icon--violet' },
    { key: 'programs', label: 'Academic programs', fallback: 'Programs in academic catalog', icon: 'A', iconClass: 'stat-icon--green' },
    { key: 'activeSessions', label: 'Active sessions', fallback: 'Currently active academic sessions', icon: 'C', iconClass: 'stat-icon--amber' }
  ] as const;

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.getSummary().subscribe({
      next: result => {
        this.summary.set(result);
        this.updatedAt.set(`Updated ${new Intl.DateTimeFormat('en-PK', { hour: '2-digit', minute: '2-digit' }).format(result.dataUpdatedAt)}`);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Please check your connection and try again.');
        this.loading.set(false);
      }
    });
  }

  percentage(value: number): number {
    const total = this.summary()?.studentStatuses?.reduce((sum, item) => sum + item.value, 0) ?? 0;
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}