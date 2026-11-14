import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { canAccess } from '../../core/auth/access';
import { AuthService } from '../../core/services/auth.service';
import { Icon } from '../../shared/components/icon/icon';
import { DashboardService } from './dashboard.service';
import { DashboardActivity, DashboardAnalytics, DashboardNotice, DashboardSummary } from './dashboard.models';

interface QuickAction { label: string; icon: string; tone: string; path: string; permissions: string[]; }

const ACTIONS: QuickAction[] = [
  { label: 'Add Student', icon: 'user-plus', tone: 'blue', path: '/students/new', permissions: ['students.manage'] },
  { label: 'Create Course', icon: 'book', tone: 'violet', path: '/courses', permissions: ['academic-catalog.manage'] },
  { label: 'Record Attendance', icon: 'calendar-check', tone: 'green', path: '/attendance', permissions: ['attendance.manage'] },
  { label: 'Check Results', icon: 'trophy', tone: 'amber', path: '/examinations', permissions: ['examinations.manage'] }
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, Icon, DecimalPipe],
  template: `
    <section class="dash">
      <section class="hero">
        <div class="hero__copy">
          <h1>Welcome back, {{ name() }}! <span aria-hidden="true">👋</span></h1>
          <p>University of Agriculture Faisalabad</p>
          <p class="hero__motto">Learn • Grow • Excel</p>
        </div>
      </section>

      @if (loading()) { <p class="dash-foot">Loading university figures…</p> }

      <section class="kpi-grid" aria-label="University statistics">
        @for (card of kpis(); track card.label) {
          <article class="kpi" [attr.data-tone]="card.tone">
            <span class="kpi__icon"><app-icon [name]="card.icon" [size]="20"/></span>
            <div class="kpi__body">
              <p>{{ card.label }}</p>
              <div class="kpi__figure"><strong>{{ card.value }}</strong></div>
              <small class="stat-card__caption">{{ card.caption }}</small>
            </div>
          </article>
        }
      </section>

      <section class="dash-mid">
        <article class="panel chart-panel">
          <header class="panel__head">
            <h2>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9h3v10zM10.5 19V4h3v15zM17 19v-7h3v7z"/></svg>
              University snapshot
            </h2>
          </header>
          @if (analytics(); as figures) {
            <div class="insight">
              <span><small>Active students</small><strong>{{ figures.students.active | number }}</strong></span>
              <span><small>Pending admissions</small><strong>{{ figures.admissions.pending | number }}</strong></span>
              <span><small>Outstanding fees</small><strong>{{ figures.finance.outstandingBalance | number:'1.0-0' }} {{ figures.finance.currency }}</strong></span>
            </div>
            <p class="dash-foot">Live totals from the analytics API. Historical semester charts are not stored.</p>
          } @else if (!loading()) {
            <div class="empty-state">
              <strong>Analytics are not available for this account</strong>
              <p>The dashboard analytics endpoint requires the analytics permission.</p>
            </div>
          }
        </article>

        <article class="panel">
          <header class="panel__head">
            <h2>
              <svg class="bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 10-12h-7l0-8z"/></svg>
              Quick Actions
            </h2>
          </header>
          @if (actions().length) {
            <div class="qa-grid">
              @for (action of actions(); track action.label) {
                <a class="qa" [attr.data-tone]="action.tone" [routerLink]="action.path">
                  <app-icon [name]="action.icon" [size]="22"/>
                  <span>{{ action.label }}</span>
                </a>
              }
            </div>
          } @else if (!loading()) {
            <div class="empty-state"><strong>No quick actions</strong><p>This account does not have a module shortcut on the dashboard.</p></div>
          }
        </article>
      </section>

      <section class="dash-bottom">
        <article class="panel">
          <header class="panel__head"><h2><app-icon name="clock" [size]="16"/> Recent Activity</h2></header>
          @if (activity().length) {
            <ol class="timeline">
              @for (item of activity(); track item.id) {
                <li [attr.data-tone]="tone(item.action)">
                  <strong>{{ item.action }} {{ item.entityType }}</strong>
                  <small>{{ when(item.occurredAtUtc) }}</small>
                </li>
              }
            </ol>
          } @else if (!loading()) {
            <div class="empty-state"><strong>No activity to show</strong><p>Audit activity is empty, or this account cannot read the audit trail.</p></div>
          }
        </article>

        <article class="panel">
          <header class="panel__head"><h2><app-icon name="megaphone" [size]="16"/> Latest Notices</h2></header>
          @if (notices().length) {
            <ul class="notice-list">
              @for (notice of notices(); track notice.id) {
                <li>
                  <i></i>
                  <div><strong>{{ notice.title }}</strong><small>{{ when(notice.createdAtUtc) }}</small></div>
                  <span class="tag" [attr.data-tone]="notice.readAtUtc ? 'violet' : 'blue'">{{ notice.readAtUtc ? 'Read' : 'New' }}</span>
                </li>
              }
            </ul>
          } @else if (!loading()) {
            <div class="empty-state"><strong>No notices</strong><p>Your notification inbox is empty.</p></div>
          }
        </article>

        <aside class="campus-card">
          <svg class="campus-card__leaf" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M24 40c-1-8 2-16 10-22-8 1-14 6-16 14 6-2 10-2 14 0-2 4-5 7-8 8z"/>
            <path d="M22 38c-8-2-14-8-16-16 6 1 11 5 14 12-2 2-2 3 2 4z"/>
          </svg>
          <h2>University of Agriculture Faisalabad</h2>
          <p>Building a Better Future Together</p>
          @if (canOpenStudents()) { <a routerLink="/students">Student directory →</a> }
          <div class="campus-card__photo"></div>
          <div class="campus-dots" aria-hidden="true"><i class="is-on"></i><i></i><i></i></div>
        </aside>
      </section>
    </section>
  `
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  private readonly dashboard = inject(DashboardService);
  readonly loading = signal(true);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly analytics = signal<DashboardAnalytics | null>(null);
  readonly activity = signal<DashboardActivity[]>([]);
  readonly notices = signal<DashboardNotice[]>([]);
  readonly name = computed(() => this.auth.currentUser()?.fullName || 'there');
  readonly actions = computed(() => ACTIONS.filter(action => canAccess(this.auth.currentUser(), action.permissions)));
  readonly canOpenStudents = computed(() => canAccess(this.auth.currentUser(), ['students.manage']));
  readonly kpis = computed(() => {
    const summary = this.summary();
    return [
      this.card('Total Students', summary?.students.value ?? null, summary?.students.available ? 'Registered student records' : 'Not available for this account', 'users', 'blue'),
      this.card('Total Employees', summary?.employees.value ?? null, summary?.employees.available ? 'University employee records' : 'Not available for this account', 'users', 'violet'),
      this.card('Academic Programs', summary?.programs.value ?? null, summary?.programs.available ? 'Configured academic programs' : 'Not available for this account', 'graduation', 'green'),
      this.card('Active Sessions', summary?.activeSessions.value ?? null, summary?.activeSessions.available ? 'Currently active academic sessions' : 'Not available for this account', 'calendar', 'orange')
    ];
  });

  constructor() {
    forkJoin({
      summary: this.dashboard.getSummary(),
      analytics: this.dashboard.getAnalytics(),
      notices: this.dashboard.getNotices(),
      activity: this.dashboard.getActivity()
    }).subscribe(({ summary, analytics, notices, activity }) => {
      this.summary.set(summary);
      this.analytics.set(analytics);
      this.notices.set(notices ?? []);
      this.activity.set(activity ?? []);
      this.loading.set(false);
    });
  }

  tone(action: string): string {
    if (action === 'Create') return 'green';
    if (action === 'Delete') return 'rose';
    return 'blue';
  }

  when(value: string): string {
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return value;
    const minutes = Math.round((Date.now() - then) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return new Date(value).toLocaleDateString();
  }

  private card(label: string, value: number | null, caption: string, icon: string, tone: string) {
    return { label, value: value === null ? '—' : value.toLocaleString('en-PK'), caption, icon, tone };
  }
}
