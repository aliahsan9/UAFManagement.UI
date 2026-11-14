import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { canAccess, roleLabel } from '../../core/auth/access';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';
import { InboxNotice, ShellFeedService, StudentHit } from '../../core/services/shell-feed.service';
import { Icon } from '../../shared/components/icon/icon';

interface NavItem { label: string; path: string; icon: string; permissions?: string[]; exact?: boolean; roles?: string[]; }
interface NavGroup { id: string; label: string; items: NavItem[]; }
interface MenuItem { label: string; icon: string; path?: string; exact?: boolean; quiet?: boolean; action?: 'notices'; permissions?: string[]; roles?: string[]; }
interface MenuGroup { label: string; items: MenuItem[]; }

const MENU: MenuGroup[] = [
  {
    label: 'Academic Management',
    items: [
      { label: 'Students', path: '/students', icon: 'users', permissions: ['students.manage'] },
      { label: 'Courses', path: '/courses', icon: 'book', permissions: ['academic-catalog.manage'] },
      { label: 'Faculties', path: '/academic-structure/faculties', icon: 'landmark', permissions: ['academic-structure.manage'] },
      { label: 'Departments', path: '/academic-structure/departments', icon: 'building', permissions: ['academic-structure.manage'] },
      { label: 'Academic Programs', path: '/academic-structure/programs', icon: 'graduation', permissions: ['academic-structure.manage'] },
      { label: 'Academic Sessions', path: '/academic-sessions', icon: 'calendar', permissions: ['academic-catalog.manage'] },
      { label: 'Course offerings', path: '/course-offerings', icon: 'layers', permissions: ['course-offerings.manage'] },
      { label: 'Attendance', path: '/attendance', icon: 'calendar-check', permissions: ['attendance.manage'] },
      { label: 'Timetable', path: '/timetable', icon: 'clock', permissions: ['timetable.manage'] },
      { label: 'Examinations', path: '/examinations', icon: 'clipboard', exact: true, permissions: ['examinations.manage'] },
      { label: 'Examination approvals', path: '/examinations/approvals', icon: 'badge-check', permissions: ['examinations.manage', 'examinations.approve'] },
      { label: 'Universities', path: '/academic-structure/universities', icon: 'school', permissions: ['academic-structure.manage'] },
      { label: 'Campuses', path: '/academic-structure/campuses', icon: 'map', permissions: ['academic-structure.manage'] },
      { label: 'Grade scales', path: '/grading/scales', icon: 'chart', permissions: ['grading-scales.manage'] },
      { label: 'Grade finalization', path: '/grading/finalization', icon: 'badge-check', permissions: ['course-grades.manage'] },
      { label: 'Grade appeals', path: '/grading/appeals', icon: 'file', permissions: ['grade-appeals.review'] },
      { label: 'Revision requests', path: '/grading/revisions', icon: 'clipboard', exact: true, permissions: ['grade-revisions.manage'] },
      { label: 'Revision approvals', path: '/grading/revisions/approvals', icon: 'trophy', permissions: ['grade-revisions.manage', 'grade-revisions.approve'] }
    ]
  },
  {
    label: 'Administration',
    items: [
      { label: 'Admissions', path: '/admissions/staff', icon: 'inbox', exact: true, permissions: ['Admissions.Staff'] },
      { label: 'Application queue', path: '/admissions/staff/applications', icon: 'file', permissions: ['Admissions.Staff'] },
      { label: 'Registration series', path: '/admissions/staff/registration-series', icon: 'badge-check', permissions: ['Admissions.Staff', 'Admissions.Decision'] },
      { label: 'Employees', path: '/employees', icon: 'briefcase', permissions: ['employees.manage'] },
      { label: 'Finance', path: '/finance', icon: 'card', permissions: ['finance.manage'] },
      { label: 'Issue transcript', path: '/transcripts/issue', icon: 'file', permissions: ['transcripts.issue'] },
      { label: 'System health', path: '/system/health', icon: 'activity', roles: ['SuperAdmin'] },
      { label: 'Notifications', icon: 'bell', action: 'notices' }
    ]
  }
];

const NAV: NavGroup[] = [
  {
    id: 'academic',
    label: 'Academic Management',
    items: [
      { label: 'Students', path: '/students', icon: 'users', permissions: ['students.manage'] },
      { label: 'Courses', path: '/courses', icon: 'book', permissions: ['academic-catalog.manage'] },
      { label: 'Faculties', path: '/academic-structure/faculties', icon: 'landmark', permissions: ['academic-structure.manage'] },
      { label: 'Departments', path: '/academic-structure/departments', icon: 'building', permissions: ['academic-structure.manage'] },
      { label: 'Academic Programs', path: '/academic-structure/programs', icon: 'graduation', permissions: ['academic-structure.manage'] },
      { label: 'Academic Sessions', path: '/academic-sessions', icon: 'calendar', permissions: ['academic-catalog.manage'] },
      { label: 'Examinations', path: '/examinations', icon: 'clipboard', permissions: ['examinations.manage'], exact: true },
      { label: 'Examination approvals', path: '/examinations/approvals', icon: 'badge-check', permissions: ['examinations.manage', 'examinations.approve'] },
      { label: 'Attendance', path: '/attendance', icon: 'calendar-check', permissions: ['attendance.manage'] },
      { label: 'Course offerings', path: '/course-offerings', icon: 'layers', permissions: ['course-offerings.manage'] },
      { label: 'Timetable', path: '/timetable', icon: 'clock', permissions: ['timetable.manage'] },
      { label: 'Universities', path: '/academic-structure/universities', icon: 'school', permissions: ['academic-structure.manage'] },
      { label: 'Campuses', path: '/academic-structure/campuses', icon: 'map', permissions: ['academic-structure.manage'] },
      { label: 'Grade scales', path: '/grading/scales', icon: 'chart', permissions: ['grading-scales.manage'] },
      { label: 'Grade finalization', path: '/grading/finalization', icon: 'badge-check', permissions: ['course-grades.manage'] },
      { label: 'Grade appeals', path: '/grading/appeals', icon: 'file', permissions: ['grade-appeals.review'] },
      { label: 'Revision requests', path: '/grading/revisions', icon: 'clipboard', permissions: ['grade-revisions.manage'] },
      { label: 'Revision approvals', path: '/grading/revisions/approvals', icon: 'trophy', permissions: ['grade-revisions.manage', 'grade-revisions.approve'] }
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      { label: 'Admissions', path: '/admissions/staff', icon: 'inbox', permissions: ['Admissions.Staff'], exact: true },
      { label: 'Application queue', path: '/admissions/staff/applications', icon: 'file', permissions: ['Admissions.Staff'] },
      { label: 'Registration series', path: '/admissions/staff/registration-series', icon: 'badge-check', permissions: ['Admissions.Staff', 'Admissions.Decision'] },
      { label: 'Employees', path: '/employees', icon: 'briefcase', permissions: ['employees.manage'] },
      { label: 'Finance', path: '/finance', icon: 'card', permissions: ['finance.manage'] },
      { label: 'Issue transcript', path: '/transcripts/issue', icon: 'file', permissions: ['transcripts.issue'] },
      { label: 'System health', path: '/system/health', icon: 'activity', roles: ['SuperAdmin'] }
    ]
  }
];

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard', students: 'Students', courses: 'Courses', faculties: 'Faculties',
  departments: 'Departments', programs: 'Academic Programs', 'academic-sessions': 'Academic Sessions',
  examinations: 'Examinations', approvals: 'Examination approvals', attendance: 'Attendance',
  'course-offerings': 'Course offerings', timetable: 'Timetable', universities: 'Universities',
  campuses: 'Campuses', admissions: 'Admissions', staff: 'Admissions', applications: 'Application queue',
  'registration-series': 'Registration series', employees: 'Employees', 'academic-structure': 'Academic structure',
  grading: 'Grading', scales: 'Grade scales', finalization: 'Grade finalization', appeals: 'Grade appeals',
  revisions: 'Revision requests', finance: 'Finance', transcripts: 'Transcripts', issue: 'Issue transcript',
  system: 'System', health: 'System health', new: 'Create', edit: 'Edit'
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: `
  <div class="admin-shell" [class.sidebar-open]="sidebarOpen()" [class.is-collapsed]="collapsed()">
    @if (sidebarOpen()) { <button class="sidebar-backdrop" type="button" aria-label="Close navigation" (click)="sidebarOpen.set(false)"></button> }
    <aside class="sidebar">
      <a class="brand" routerLink="/dashboard">
        <svg class="brand__emblem" viewBox="0 0 64 64" aria-hidden="true">
          <g fill="#fff">
            <ellipse cx="32" cy="13" rx="3.1" ry="5"/>
            <ellipse cx="26.2" cy="19" rx="2.8" ry="5" transform="rotate(-32 26.2 19)"/>
            <ellipse cx="37.8" cy="19" rx="2.8" ry="5" transform="rotate(32 37.8 19)"/>
            <ellipse cx="23.2" cy="26" rx="2.6" ry="4.8" transform="rotate(-42 23.2 26)"/>
            <ellipse cx="40.8" cy="26" rx="2.6" ry="4.8" transform="rotate(42 40.8 26)"/>
            <ellipse cx="22.4" cy="33" rx="2.4" ry="4.4" transform="rotate(-52 22.4 33)"/>
            <ellipse cx="41.6" cy="33" rx="2.4" ry="4.4" transform="rotate(52 41.6 33)"/>
            <rect x="30.7" y="16" width="2.6" height="26" rx="1.2"/>
          </g>
          <g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round">
            <path d="M24 22c-8 2-14 11-15 20 8-2 13-8 15-16"/>
            <path d="M21 31c-6 3-9 9-9 16"/>
            <path d="M40 22c8 2 14 11 15 20-8-2-13-8-15-16"/>
            <path d="M43 31c6 3 9 9 9 16"/>
            <path d="M8 50c6-3.2 10-3.2 16 0s10 3.2 16 0 10-3.2 16 0"/>
            <path d="M12 55c5.2-2.6 8.4-2.6 13.6 0s8.4 2.6 13.6 0 8.4-2.6 13.6 0"/>
            <path d="M17 59.5c4.2-2 7-2 11.2 0s7 2 11.2 0 7-2 11.2 0"/>
          </g>
        </svg>
        <span class="brand-copy"><strong>UAF</strong><small>University of Agriculture Faisalabad</small></span>
      </a>
      <div class="sidebar-scroll">
        <a class="nav-item" routerLink="/dashboard" routerLinkActive="is-active" [routerLinkActiveOptions]="{exact: true}" data-label="Dashboard" (click)="closeMobile()">
          <svg class="home-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z"/></svg>
          <span class="nav-label">Dashboard</span>
        </a>
        @for (group of visibleMenu(); track group.label) {
          <p class="nav-section">{{ group.label }}</p>
          @for (item of group.items; track item.label) {
            @if (item.path) {
              <a class="nav-item" [routerLink]="item.path" [routerLinkActive]="item.quiet ? '' : 'is-active'" [routerLinkActiveOptions]="{exact: !!item.exact}" [attr.data-label]="item.label" (click)="closeMobile()">
                <app-icon [name]="item.icon" [size]="18"/><span class="nav-label">{{ item.label }}</span>
              </a>
            } @else {
              <button class="nav-item" type="button" [attr.data-label]="item.label" [attr.data-notices]="item.action === 'notices' ? '' : null" (click)="onMenuAction(item, $event)">
                <app-icon [name]="item.icon" [size]="18"/><span class="nav-label">{{ item.label }}</span>
              </button>
            }
          }
        }
      </div>
      <div class="sidebar-foot">
        <div class="sidebar-user">
          <button type="button" class="sidebar-user__button" (click)="toggleProfile($event)" [attr.aria-expanded]="profileOpen()">
              <span class="avatar-photo" aria-hidden="true">{{ initials() }}</span>
            <span class="who"><strong>{{ displayName() }}</strong><small>{{ primaryRole() }}</small></span>
            <app-icon class="user-chevron" name="chevron" [size]="16"/>
          </button>
          @if (profileOpen()) {
            <div class="user-pop">
              <p>{{ auth.currentUser()?.email }}</p>
            </div>
          }
        </div>
        <button class="sidebar-logout" type="button" (click)="logout()"><app-icon name="logout" [size]="16"/><span class="nav-label">Logout</span></button>
      </div>
    </aside>
    <div class="admin-main">
      <header class="topbar">
        <button class="icon-button" type="button" (click)="toggleNav($event)" aria-label="Toggle navigation"><app-icon name="menu" [size]="18"/></button>
        <div class="search-wrap topbar-search">
          <label class="global-search">
            <app-icon name="search" [size]="16"/>
            <input aria-label="Search students and pages" placeholder="Search students, courses, or features..." [value]="searchTerm()" (input)="onSearch($any($event.target).value)" (focus)="searchOpen.set(!!searchTerm())">
          </label>
          @if (searchOpen() && searchTerm()) {
            <div class="menu-panel search-panel" role="listbox">
              @if (navMatches().length) {
                <p class="menu-panel__label">Pages</p>
                @for (item of navMatches(); track item.path) {
                  <a [routerLink]="item.path" (click)="clearSearch()">{{ item.label }}</a>
                }
              }
              @if (canSearchStudents()) {
                <p class="menu-panel__label">Students</p>
                @if (studentHits() === null) { <span class="menu-panel__note">Student search is not available for this account.</span> }
                @else if (!studentHits()!.length && searchTerm().trim().length >= 2) { <span class="menu-panel__note">No matching students.</span> }
                @else { @for (hit of studentHits(); track hit.id) { <a [routerLink]="['/students', hit.id]" (click)="clearSearch()"><strong>{{ hit.fullName }}</strong><small>{{ hit.registrationNumber }}</small></a> } }
              }
              @if (!navMatches().length && !canSearchStudents()) { <span class="menu-panel__note">No matching pages.</span> }
            </div>
          }
        </div>
        <div class="topbar-tools">
          <div class="notification-wrap">
            <button class="icon-button" type="button" aria-label="Notifications" (click)="toggleNotices($event)">
              <app-icon name="bell" [size]="18"/>
              @if (noticeCount()) { <span class="bell-badge">{{ noticeCount() }}</span> }
            </button>
            @if (noticesOpen()) {
              <div class="menu-panel">
                <strong>Notifications</strong>
                @if (notices() === null) { <p class="menu-panel__note">Notifications could not be loaded.</p> }
                @else if (!notices()!.length) { <p class="menu-panel__note">You are all caught up.</p> }
                @else {
                  @for (notice of notices(); track notice.id) {
                    <button type="button" class="notice-row" (click)="openNotice(notice)">
                      <strong>{{ notice.title }}</strong>
                      <small>{{ notice.message }}</small>
                    </button>
                  }
                }
              </div>
            }
          </div>
          <span class="top-divider" aria-hidden="true"></span>
          <button class="icon-button" type="button" (click)="toggleTheme()" [attr.aria-label]="theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'">
            <app-icon [name]="theme() === 'dark' ? 'sun' : 'moon'" [size]="18"/>
          </button>
          <span class="top-divider" aria-hidden="true"></span>
          <div class="language-wrap">
            <button class="lang-button" type="button" (click)="toggleLanguage($event)" [attr.aria-expanded]="languageOpen()">
              <span>English</span><app-icon name="chevron" [size]="14"/>
            </button>
            @if (languageOpen()) {
              <div class="menu-panel lang-panel"><button type="button" class="notice-row"><strong>English</strong></button></div>
            }
          </div>
        </div>
      </header>
      <main class="page-content"><router-outlet/></main>
    </div>
  </div>`
})
export class AdminLayout {
  readonly auth = inject(AuthService);
  private readonly noticesApi = inject(ShellFeedService);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(NotificationService);
  private readonly router = inject(Router);
  readonly visibleMenu = computed(() => MENU.map(group => ({
    ...group,
    items: group.items.filter(item => this.allowNav(item))
  })).filter(group => group.items.length > 0));
  readonly sidebarOpen = signal(false);
  readonly collapsed = signal(localStorage.getItem('uaf-sidebar') === '1');
  readonly profileOpen = signal(false);
  readonly languageOpen = signal(false);
  readonly noticesOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly searchTerm = signal('');
  readonly notices = signal<InboxNotice[] | null>([]);
  readonly studentHits = signal<StudentHit[] | null>([]);
  readonly path = signal(this.router.url.split('?')[0]);
  readonly theme = signal<'light' | 'dark'>(localStorage.getItem('uaf-theme') === 'dark' ? 'dark' : 'light');
  readonly openGroups = signal<Record<string, boolean>>({ academic: true, administration: true });
  readonly year = new Date().getFullYear();
  private searchTimer?: ReturnType<typeof setTimeout>;

  readonly groups = computed(() => NAV.map(group => ({
    ...group,
    items: group.items.filter(item => this.allowNav(item))
  })).filter(group => group.items.length > 0));
  readonly navMatches = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return [];
    return this.groups().flatMap(group => group.items).filter(item => item.label.toLowerCase().includes(query)).slice(0, 6);
  });
  readonly crumbs = computed(() => {
    const parts = this.path().split('/').filter(Boolean);
    const crumbs: { label: string; url: string }[] = [];
    let url = '';
    for (const part of parts) {
      url += `/${part}`;
      if (/^[0-9a-f-]{16,}$/i.test(part)) continue;
      crumbs.push({ label: TITLES[part] ?? part.replaceAll('-', ' '), url });
    }
    return crumbs;
  });
  readonly displayName = computed(() => this.auth.currentUser()?.fullName || this.auth.currentUser()?.email || 'Account');
  readonly initials = computed(() => this.displayName().split(' ').slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || 'U');
  readonly primaryRole = computed(() => {
    const role = this.auth.currentUser()?.roles?.[0];
    return role ? roleLabel(role) : 'Portal account';
  });
  readonly canSearchStudents = computed(() => canAccess(this.auth.currentUser(), ['students.manage']));
  readonly unread = computed(() => (this.notices() ?? []).some(notice => !notice.readAtUtc));
  readonly noticeCount = computed(() => {
    const items = this.notices();
    if (!items) return 0;
    return items.filter(notice => !notice.readAtUtc).length;
  });

  constructor() {
    document.documentElement.dataset['theme'] = this.theme();
    this.noticesApi.notices().subscribe(items => this.notices.set(items ?? []));
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.path.set(this.router.url.split('?')[0]);
      this.profileOpen.set(false);
      this.noticesOpen.set(false);
      this.searchOpen.set(false);
      this.sidebarOpen.set(false);
    });
  }

  @HostListener('document:click', ['$event'])
  closePopovers(event?: MouseEvent): void {
    const target = event?.target as HTMLElement | null;
    if (!target?.closest('.sidebar-user')) this.profileOpen.set(false);
    if (!target?.closest('.notification-wrap') && !target?.closest('[data-notices]')) this.noticesOpen.set(false);
    if (!target?.closest('.search-wrap')) this.searchOpen.set(false);
    if (!target?.closest('.language-wrap')) this.languageOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closePopovers(); this.sidebarOpen.set(false); }

  toggleNav(event: Event): void {
    event.stopPropagation();
    if (window.matchMedia('(max-width: 1080px)').matches) this.sidebarOpen.update(open => !open);
    else {
      this.collapsed.update(value => !value);
      localStorage.setItem('uaf-sidebar', this.collapsed() ? '1' : '0');
    }
  }

  toggleGroup(id: string): void { this.openGroups.update(state => ({ ...state, [id]: !state[id] })); }
  closeMobile(): void { this.sidebarOpen.set(false); }
  toggleProfile(event: Event): void { event.stopPropagation(); this.profileOpen.update(open => !open); this.noticesOpen.set(false); this.languageOpen.set(false); }
  toggleLanguage(event: Event): void { event.stopPropagation(); this.languageOpen.update(open => !open); this.noticesOpen.set(false); this.profileOpen.set(false); }
  onMenuAction(item: MenuItem, event: Event): void {
    event.stopPropagation();
    this.closeMobile();
    if (item.action === 'notices') this.toggleNotices(event);
  }

  toggleNotices(event: Event): void {
    event.stopPropagation();
    this.noticesOpen.update(open => !open);
    this.profileOpen.set(false);
    if (this.noticesOpen()) {
      this.noticesApi.notices().subscribe(items => this.notices.set(items));
    }
  }

  openNotice(notice: InboxNotice): void {
    if (!notice.readAtUtc) {
      this.noticesApi.markRead(notice.id).subscribe({
        next: () => this.notices.update(items => items?.map(item => item.id === notice.id ? { ...item, readAtUtc: new Date().toISOString() } : item) ?? items)
      });
    }
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.searchOpen.set(!!value);
    clearTimeout(this.searchTimer);
    if (!this.canSearchStudents() || value.trim().length < 2) { this.studentHits.set([]); return; }
    this.searchTimer = setTimeout(() => {
      this.noticesApi.searchStudents(value.trim()).subscribe(hits => this.studentHits.set(hits));
    }, 280);
  }

  clearSearch(): void { this.searchTerm.set(''); this.searchOpen.set(false); this.studentHits.set([]); }

  toggleTheme(): void {
    this.theme.update(current => current === 'dark' ? 'light' : 'dark');
    document.documentElement.dataset['theme'] = this.theme();
    localStorage.setItem('uaf-theme', this.theme());
  }

  private allowNav(item: { permissions?: string[]; roles?: string[] }): boolean {
    const user = this.auth.currentUser();
    if (item.roles?.length) {
      const roles = new Set((user?.roles ?? []).map(role => role.toLowerCase()));
      if (!item.roles.some(role => roles.has(role.toLowerCase()))) return false;
    }
    return canAccess(user, item.permissions);
  }

  async logout(): Promise<void> {
    this.profileOpen.set(false);
    const ok = await this.confirm.confirm('You will need to sign in again to access the portal.', { title: 'Sign out of your account?', confirmText: 'Sign out', danger: true });
    if (!ok) return;
    this.auth.logout().subscribe(() => {
      this.toast.show('You have been signed out.', 'success');
      void this.router.navigateByUrl('/auth/login');
    });
  }
}
