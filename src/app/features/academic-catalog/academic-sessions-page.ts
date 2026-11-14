import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AcademicCatalogService } from './academic-catalog.service';
import {
  AcademicSession, AcademicSessionRequest, AcademicSessionStatus, SESSION_STATUS_OPTIONS,
  sessionStatusLabel, sessionStatusValue
} from './academic-catalog.models';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';

const dateRangeValidator: ValidatorFn = control => {
  const start = control.get('startDate')?.value as string | undefined;
  const end = control.get('endDate')?.value as string | undefined;
  return start && end && end <= start ? { invalidDateRange: true } : null;
};

@Component({
  selector: 'app-academic-sessions-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
  <section class="container-fluid px-0">
    <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div><div class="text-uppercase small fw-semibold text-primary mb-2">Academic catalog / Calendar</div><h1 class="h3 fw-bold mb-1">Academic sessions</h1><p class="text-secondary mb-0">Manage academic calendars and session lifecycle.</p></div>
      <button class="btn btn-primary" type="button" (click)="openCreate()">Create session</button>
    </div>
    @if(error()){<div class="alert alert-danger d-flex justify-content-between align-items-center" role="alert"><span>{{ error() }}</span><button class="btn btn-sm btn-outline-danger" type="button" (click)="load()">Retry</button></div>}
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white border-0 px-4 pt-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3"><div><h2 class="h6 fw-bold mb-1">Session register</h2><p class="small text-secondary mb-0">Live records from the academic sessions API</p></div>
          <div class="d-flex align-items-center gap-2"><label for="session-status-filter" class="small text-secondary">Status</label><select id="session-status-filter" class="form-select form-select-sm" style="min-width:155px" [value]="statusFilter()" (change)="changeStatusFilter($any($event.target).value)">@for(option of statusOptions;track option.value){<option [value]="option.value">{{ option.label }}</option>}</select><button class="btn btn-sm btn-outline-secondary" type="button" (click)="load()" [disabled]="loading()">Refresh</button></div>
        </div>
      </div>
      <div class="card-body px-4 pb-4">
        @if(loading()){<div class="py-5 text-center text-secondary"><span class="spinner-border spinner-border-sm me-2" role="status"></span>Loading academic sessions…</div>}
        @else {<div class="table-responsive"><table class="table table-hover align-middle mb-0">
          <thead class="table-light"><tr><th>Session</th><th>Code</th><th>Start date</th><th>End date</th><th>Status</th><th class="text-end">Actions</th></tr></thead>
          <tbody>@for(session of sessions();track session.id){<tr>
            <td class="fw-semibold">{{session.name}}</td><td><span class="font-monospace">{{session.code}}</span></td><td>{{formatDate(session.startDate)}}</td><td>{{formatDate(session.endDate)}}</td>
            <td><span class="badge rounded-pill" [class.text-bg-primary]="statusValue(session.status)===planned" [class.text-bg-success]="statusValue(session.status)===active" [class.text-bg-secondary]="statusValue(session.status)===3" [class.text-bg-danger]="statusValue(session.status)===4">{{statusLabel(session.status)}}</span></td>
            <td class="text-end"><div class="d-inline-flex flex-wrap justify-content-end gap-1">
              <button class="btn btn-sm btn-outline-secondary" type="button" (click)="viewDetails(session)">Details</button>
              @if(canEdit(session)){<button class="btn btn-sm btn-outline-primary" type="button" (click)="openEdit(session)">Edit</button>}
              @if(statusValue(session.status) === planned){<button class="btn btn-sm btn-outline-success" type="button" (click)="transition(session,'activate')">Activate</button>}
              @if(statusValue(session.status) === active){<button class="btn btn-sm btn-outline-success" type="button" (click)="transition(session,'complete')">Complete</button>}
              @if(statusValue(session.status) === planned || statusValue(session.status) === active){<button class="btn btn-sm btn-outline-danger" type="button" (click)="transition(session,'cancel')">Cancel</button>}
            </div></td>
          </tr>}@empty{<tr><td colspan="6" class="text-center py-5 text-secondary">No academic sessions found for this filter.</td></tr>}</tbody>
        </table></div>}
      </div>
    </div>
  </section>

  @if(formOpen()){<div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" (click)="closeForm()"><div class="modal-dialog modal-dialog-centered" role="document" (click)="$event.stopPropagation()"><div class="modal-content border-0 shadow">
    <div class="modal-header"><div><h2 class="modal-title fs-5 fw-bold">{{editingId()?'Edit academic session':'Create academic session'}}</h2><p class="small text-secondary mb-0">End date must be later than start date.</p></div><button type="button" class="btn-close" aria-label="Close" (click)="closeForm()"></button></div>
    <form [formGroup]="form" (ngSubmit)="save()"><div class="modal-body"><div class="row g-3">
      <div class="col-12"><label class="form-label" for="session-name">Session name</label><input id="session-name" class="form-control" formControlName="name" maxlength="100" placeholder="e.g. Fall 2026"><div class="form-text">Maximum 100 characters.</div>@if(form.controls.name.touched&&form.controls.name.invalid){<div class="text-danger small">A session name is required.</div>}</div>
      <div class="col-12"><label class="form-label" for="session-code">Session code</label><input id="session-code" class="form-control text-uppercase" formControlName="code" maxlength="30" placeholder="e.g. FA-2026">@if(form.controls.code.touched&&form.controls.code.invalid){<div class="text-danger small">A code is required (maximum 30 characters).</div>}</div>
      <div class="col-md-6"><label class="form-label" for="session-start">Start date</label><input id="session-start" class="form-control" type="date" formControlName="startDate"></div>
      <div class="col-md-6"><label class="form-label" for="session-end">End date</label><input id="session-end" class="form-control" type="date" formControlName="endDate"></div>
      @if(form.hasError('invalidDateRange')&&(form.controls.startDate.touched||form.controls.endDate.touched)){<div class="col-12"><div class="text-danger small">End date must be after start date.</div></div>}
      @if(form.controls.startDate.touched&&form.controls.startDate.invalid||form.controls.endDate.touched&&form.controls.endDate.invalid){<div class="col-12"><div class="text-danger small">Both dates are required.</div></div>}
    </div></div><div class="modal-footer"><button class="btn btn-outline-secondary" type="button" (click)="closeForm()">Cancel</button><button class="btn btn-primary" type="submit" [disabled]="saving()">{{saving()?'Saving…':(editingId()?'Save changes':'Create session')}}</button></div></form>
  </div></div></div>}

  @if(selectedSession()){<div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" (click)="selectedSession.set(null)"><div class="modal-dialog modal-dialog-centered" role="document" (click)="$event.stopPropagation()"><div class="modal-content border-0 shadow">
    <div class="modal-header"><div><h2 class="modal-title fs-5 fw-bold">Session details</h2><p class="small text-secondary mb-0">{{selectedSession()!.code}}</p></div><button class="btn-close" aria-label="Close" (click)="selectedSession.set(null)"></button></div>
    <div class="modal-body">@if(detailsLoading()){<div class="text-center py-4"><span class="spinner-border spinner-border-sm me-2"></span>Loading details…</div>}@else{<dl class="row mb-0"><dt class="col-sm-4 text-secondary">Name</dt><dd class="col-sm-8">{{selectedSession()!.name}}</dd><dt class="col-sm-4 text-secondary">Code</dt><dd class="col-sm-8 font-monospace">{{selectedSession()!.code}}</dd><dt class="col-sm-4 text-secondary">Start date</dt><dd class="col-sm-8">{{formatDate(selectedSession()!.startDate)}}</dd><dt class="col-sm-4 text-secondary">End date</dt><dd class="col-sm-8">{{formatDate(selectedSession()!.endDate)}}</dd><dt class="col-sm-4 text-secondary">Status</dt><dd class="col-sm-8"><span class="badge rounded-pill" [class.text-bg-primary]="statusValue(selectedSession()!.status)===planned" [class.text-bg-success]="statusValue(selectedSession()!.status)===active" [class.text-bg-secondary]="statusValue(selectedSession()!.status)===3" [class.text-bg-danger]="statusValue(selectedSession()!.status)===4">{{statusLabel(selectedSession()!.status)}}</span></dd><dt class="col-sm-4 text-secondary">Created</dt><dd class="col-sm-8">{{formatTimestamp(selectedSession()!.createdAtUtc)}}</dd><dt class="col-sm-4 text-secondary">Last updated</dt><dd class="col-sm-8">{{selectedSession()!.updatedAtUtc?formatTimestamp(selectedSession()!.updatedAtUtc!):'—'}}</dd></dl>}</div>
  </div></div></div>}
  `
})
export class AcademicSessionsPage implements OnInit {
  private readonly api = inject(AcademicCatalogService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notifications = inject(NotificationService);
  readonly sessions = signal<AcademicSession[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly selectedSession = signal<AcademicSession | null>(null);
  readonly detailsLoading = signal(false);
  readonly statusFilter = signal('');
  readonly statusOptions = SESSION_STATUS_OPTIONS;
  readonly planned = AcademicSessionStatus.Planned;
  readonly active = AcademicSessionStatus.Active;
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(30)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  }, { validators: dateRangeValidator });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set('');
    const filter = this.statusFilter();
    const status = filter === '' ? undefined : Number(filter) as AcademicSessionStatus;
    this.api.getSessions(status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.sessions.set(value),
      error: err => { this.error.set(this.errorMessage(err)); this.loading.set(false); },
      complete: () => this.loading.set(false)
    });
  }

  changeStatusFilter(value: string): void { this.statusFilter.set(value); this.load(); }
  openCreate(): void { this.editingId.set(null); this.form.reset({name:'',code:'',startDate:'',endDate:''}); this.formOpen.set(true); }
  openEdit(session: AcademicSession): void {
    if (!this.canEdit(session)) return;
    this.editingId.set(session.id);
    this.form.reset({name:session.name,code:session.code,startDate:session.startDate,endDate:session.endDate});
    this.formOpen.set(true);
  }
  closeForm(): void { if (!this.saving()) this.formOpen.set(false); }

  save(): void {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const request: AcademicSessionRequest = { name:value.name!.trim(), code:value.code!.trim().toUpperCase(), startDate:value.startDate!, endDate:value.endDate! };
    this.saving.set(true);
    const request$ = this.editingId() ? this.api.updateSession(this.editingId()!, request) : this.api.createSession(request);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notifications.show(this.editingId()?'Academic session updated.':'Academic session created.','success'); this.formOpen.set(false); this.load(); },
      error: err => { this.notifications.show(this.errorMessage(err),'error'); this.saving.set(false); },
      complete: () => this.saving.set(false)
    });
  }

  async transition(session: AcademicSession, action: 'activate'|'complete'|'cancel'): Promise<void> {
    const label = action === 'activate' ? 'activate' : action === 'complete' ? 'complete' : 'cancel';
    const accepted = await this.confirmation.confirm(`Are you sure you want to ${label} “${session.name}”?`, {
      title: `${label[0].toUpperCase()+label.slice(1)} academic session?`,
      confirmText: label[0].toUpperCase()+label.slice(1),
      danger: action === 'cancel'
    });
    if (!accepted) return;
    const request$ = action === 'activate' ? this.api.activateSession(session.id) : action === 'complete' ? this.api.completeSession(session.id) : this.api.cancelSession(session.id);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notifications.show(`Academic session ${action === 'activate' ? 'activated' : action === 'complete' ? 'completed' : 'cancelled'} successfully.`,'success'); this.load(); },
      error: err => this.notifications.show(this.errorMessage(err),'error')
    });
  }

  viewDetails(session: AcademicSession): void {
    this.selectedSession.set(session); this.detailsLoading.set(true);
    this.api.getSession(session.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => this.selectedSession.set(value),
      error: err => { this.detailsLoading.set(false); this.notifications.show(this.errorMessage(err),'error'); },
      complete: () => this.detailsLoading.set(false)
    });
  }
  canEdit(session: AcademicSession): boolean { const status = sessionStatusValue(session.status); return status === this.planned || status === AcademicSessionStatus.Cancelled; }
  statusValue(value: AcademicSession['status']): AcademicSessionStatus { return sessionStatusValue(value); }
  statusLabel(value: AcademicSession['status']): string { return sessionStatusLabel(value); }
  formatDate(value: string): string { return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z')); }
  formatTimestamp(value: string): string { return new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)); }
  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) return error.error?.detail ?? error.error?.title ?? error.error?.message ?? (error.status===0?'Unable to reach the API. Check your connection.':`Request failed (HTTP ${error.status}).`);
    return 'An unexpected error occurred.';
  }
}
