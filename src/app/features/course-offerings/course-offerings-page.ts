import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { AcademicCatalogService } from '../academic-catalog/academic-catalog.service';
import { AcademicSession, Course, sessionStatusValue, AcademicSessionStatus } from '../academic-catalog/academic-catalog.models';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';
import { CourseOfferingsService } from './course-offerings.service';
import { CourseOffering, CourseOfferingStatus, CreateCourseOfferingRequest, OFFERING_STATUS_OPTIONS, offeringStatusClass, offeringStatusLabel, offeringStatusValue } from './course-offerings.models';

@Component({
 selector:'app-course-offerings-page',standalone:true,imports:[ReactiveFormsModule,RouterLink],
 template:`
 <section class="container-fluid px-0">
  <header class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
   <div><div class="text-uppercase small fw-semibold text-primary mb-2">Academic catalog / Delivery</div><h1 class="h3 fw-bold mb-1">Course offerings</h1><p class="text-secondary mb-0">Schedule course sections, manage availability and monitor student enrollment.</p></div>
   <button class="btn btn-primary" type="button" (click)="openCreate()" [disabled]="!referencesReady()">Create offering</button>
  </header>
  @if(referenceError()){<div class="alert alert-warning" role="alert">{{referenceError()}} Course and session lookups are required to create and label offerings.</div>}
  @if(error()){<div class="alert alert-danger d-flex justify-content-between align-items-center" role="alert"><span>{{error()}}</span><button class="btn btn-sm btn-outline-danger" type="button" (click)="load()">Retry</button></div>}
  <div class="card border-0 shadow-sm mb-3"><div class="card-body"><div class="row g-3 align-items-end">
   <div class="col-12 col-md-4"><label class="form-label" for="offering-search">Search offerings</label><input id="offering-search" class="form-control" placeholder="Course code, title or section" [value]="search()" (input)="search.set($any($event.target).value)"></div>
   <div class="col-12 col-md-3"><label class="form-label" for="offering-session">Academic session</label><select id="offering-session" class="form-select" [value]="sessionFilter()" (change)="sessionFilter.set($any($event.target).value);load()"><option value="">All sessions</option>@for(s of sessions();track s.id){<option [value]="s.id">{{s.name}} ({{s.code}})</option>}</select></div>
   <div class="col-12 col-md-3"><label class="form-label" for="offering-status">Offering status</label><select id="offering-status" class="form-select" [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value);load()">@for(s of statusOptions;track s.value){<option [value]="s.value">{{s.label}}</option>}</select></div>
   <div class="col-12 col-md-2 d-flex gap-2"><button class="btn btn-outline-secondary flex-fill" type="button" (click)="reset()">Reset</button><button class="btn btn-outline-secondary" type="button" (click)="load()" [disabled]="loading()">↻</button></div>
  </div></div></div>
  <div class="row g-3 mb-3">
   <div class="col-6 col-xl-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-secondary">Total sections</div><div class="h3 fw-bold mb-0">{{offerings().length}}</div></div></div></div>
   <div class="col-6 col-xl-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-secondary">Published</div><div class="h3 fw-bold text-success mb-0">{{countStatus(published)}}</div></div></div></div>
   <div class="col-6 col-xl-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-secondary">Enrolled seats</div><div class="h3 fw-bold mb-0">{{totalEnrolled()}}</div></div></div></div>
   <div class="col-6 col-xl-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-secondary">Available seats</div><div class="h3 fw-bold mb-0">{{availableSeats()}}</div></div></div></div>
  </div>
  <div class="card border-0 shadow-sm"><div class="card-header bg-white border-0 px-4 pt-4 d-flex justify-content-between align-items-center"><div><h2 class="h6 fw-bold mb-1">Offering register</h2><p class="small text-secondary mb-0">Sections and capacity returned by the course-offerings API.</p></div><span class="badge text-bg-light">{{filteredOfferings().length}} records</span></div>
   <div class="card-body p-0">
    @if(loading()){<div class="text-center py-5 text-secondary"><span class="spinner-border spinner-border-sm me-2"></span>Loading course offerings…</div>}
    @else{<div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th class="ps-4">Course</th><th>Session</th><th>Section</th><th>Credit hours</th><th>Enrollment</th><th>Status</th><th class="text-end pe-4">Actions</th></tr></thead><tbody>
     @for(o of filteredOfferings();track o.id){<tr>
      <td class="ps-4"><div class="fw-semibold">{{courseName(o.courseId)}}</div><div class="small text-secondary font-monospace">{{courseCode(o.courseId)}}</div></td>
      <td><div>{{sessionName(o.academicSessionId)}}</div><div class="small text-secondary">{{sessionCode(o.academicSessionId)}}</div></td>
      <td><span class="badge text-bg-light border">{{o.section}}</span></td>
      <td>{{creditHours(o.courseId)}}</td>
      <td><div class="small fw-semibold">{{o.enrolledCount}} / {{o.capacity}}</div><div class="progress mt-1" style="height:5px;min-width:85px"><div class="progress-bar" [style.width.%]="capacityPercent(o)"></div></div></td>
      <td><span class="badge rounded-pill" [class]="statusClass(o)">{{statusLabel(o)}}</span></td>
      <td class="text-end pe-4"><div class="d-inline-flex flex-wrap justify-content-end gap-1"><a class="btn btn-sm btn-outline-primary" [routerLink]="['/course-offerings',o.id]">Manage</a>
       @if(statusValue(o)===draft){<button class="btn btn-sm btn-outline-secondary" type="button" (click)="openEdit(o)">Edit</button><button class="btn btn-sm btn-outline-success" type="button" (click)="transition(o,'publish')">Publish</button>}
       @if(statusValue(o)===published){<button class="btn btn-sm btn-outline-primary" type="button" (click)="transition(o,'close')">Close</button>}
       @if(statusValue(o)===draft||statusValue(o)===published){<button class="btn btn-sm btn-outline-danger" type="button" (click)="transition(o,'cancel')">Cancel</button>}
      </div></td>
     </tr>}@empty{<tr><td colspan="7" class="text-center text-secondary py-5">No course offerings match the selected filters.</td></tr>}
    </tbody></table></div>}
   </div>
  </div>
 </section>
 @if(formOpen()){<div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" (click)="closeForm()"><div class="modal-dialog modal-dialog-centered" role="document" (click)="$event.stopPropagation()"><div class="modal-content border-0 shadow">
  <div class="modal-header"><div><h2 class="modal-title fs-5 fw-bold">{{editingId()?'Edit course offering':'Create course offering'}}</h2><p class="small text-secondary mb-0">{{editingId()?'Only capacity and instructor can be changed after creation.':'Create a section for a course in an academic session.'}}</p></div><button class="btn-close" type="button" aria-label="Close" (click)="closeForm()"></button></div>
  <form [formGroup]="form" (ngSubmit)="save()"><div class="modal-body"><div class="row g-3">
   @if(!editingId()){<div class="col-12"><label class="form-label" for="offering-course">Course</label><select id="offering-course" class="form-select" formControlName="courseId"><option value="">Select course</option>@for(c of activeCourses();track c.id){<option [value]="c.id">{{c.code}} — {{c.title}} ({{c.creditHours}} cr.)</option>}</select></div>
   <div class="col-12"><label class="form-label" for="offering-session-create">Academic session</label><select id="offering-session-create" class="form-select" formControlName="academicSessionId"><option value="">Select session</option>@for(s of availableSessions();track s.id){<option [value]="s.id">{{s.name}} ({{s.code}})</option>}</select></div>
   <div class="col-md-6"><label class="form-label" for="offering-section">Section</label><input id="offering-section" class="form-control text-uppercase" formControlName="section" maxlength="20" placeholder="A"></div>}
   <div class="col-md-6"><label class="form-label" for="offering-capacity">Capacity</label><input id="offering-capacity" class="form-control" type="number" min="1" max="1000" formControlName="capacity"></div>
   <div class="col-12"><label class="form-label" for="offering-instructor">Instructor employee ID <span class="text-secondary fw-normal">(optional)</span></label><input id="offering-instructor" class="form-control font-monospace" formControlName="instructorEmployeeId" placeholder="Employee GUID"><div class="form-text">The current offering API accepts an employee ID but does not expose an instructor lookup in this workflow.</div></div>
  </div></div><div class="modal-footer"><button class="btn btn-outline-secondary" type="button" (click)="closeForm()">Cancel</button><button class="btn btn-primary" type="submit" [disabled]="saving()">{{saving()?'Saving…':(editingId()?'Save changes':'Create offering')}}</button></div></form>
 </div></div></div>}
 `
})
export class CourseOfferingsPage implements OnInit {
 private readonly api=inject(CourseOfferingsService);private readonly catalog=inject(AcademicCatalogService);private readonly fb=inject(FormBuilder);private readonly destroyRef=inject(DestroyRef);private readonly confirmation=inject(ConfirmationService);private readonly notices=inject(NotificationService);
 readonly offerings=signal<CourseOffering[]>([]);readonly courses=signal<Course[]>([]);readonly sessions=signal<AcademicSession[]>([]);
 readonly loading=signal(false);readonly saving=signal(false);readonly error=signal<string|null>(null);readonly referenceError=signal<string|null>(null);
 readonly search=signal('');readonly sessionFilter=signal('');readonly statusFilter=signal('');readonly formOpen=signal(false);readonly editingId=signal<string|null>(null);
 readonly statusOptions=OFFERING_STATUS_OPTIONS;readonly draft=CourseOfferingStatus.Draft;readonly published=CourseOfferingStatus.Published;
 readonly activeCourses=computed(()=>this.courses().filter(x=>x.isActive));
 readonly availableSessions=computed(()=>this.sessions().filter(x=>sessionStatusValue(x.status)===AcademicSessionStatus.Planned||sessionStatusValue(x.status)===AcademicSessionStatus.Active));
 readonly referencesReady=computed(()=>this.activeCourses().length>0&&this.availableSessions().length>0);
 readonly filteredOfferings=computed(()=>{const term=this.search().trim().toLowerCase();return this.offerings().filter(o=>(!this.sessionFilter()||o.academicSessionId===this.sessionFilter())&&(!this.statusFilter()||this.statusValue(o)===Number(this.statusFilter()))&&(!term||[this.courseName(o.courseId),this.courseCode(o.courseId),o.section,this.sessionName(o.academicSessionId)].some(v=>v.toLowerCase().includes(term))));});
 readonly totalEnrolled=computed(()=>this.offerings().reduce((sum,o)=>sum+o.enrolledCount,0));
 readonly availableSeats=computed(()=>this.offerings().reduce((sum,o)=>sum+Math.max(0,o.capacity-o.enrolledCount),0));
 readonly form=this.fb.nonNullable.group({courseId:['',Validators.required],academicSessionId:['',Validators.required],section:['',[Validators.required,Validators.maxLength(20)]],capacity:[30,[Validators.required,Validators.min(1),Validators.max(1000)]],instructorEmployeeId:['']});
 ngOnInit():void{this.loadReferences();this.load();}
 loadReferences():void{forkJoin({courses:this.catalog.getCourses({isActive:true}),sessions:this.catalog.getSessions()}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{this.courses.set(r.courses);this.sessions.set(r.sessions);this.referenceError.set(null);},error:()=>this.referenceError.set('Course and academic session reference data could not be loaded. Verify Academic Catalog permissions.')});}
 load():void{this.loading.set(true);this.error.set(null);const filters:{academicSessionId?:string;status?:number}={};if(this.sessionFilter())filters.academicSessionId=this.sessionFilter();if(this.statusFilter())filters.status=Number(this.statusFilter());this.api.getOfferings(filters).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{this.offerings.set(r);this.loading.set(false);},error:e=>{this.error.set(this.apiError(e,'Course offerings could not be loaded.'));this.loading.set(false);}});}
 reset():void{this.search.set('');this.sessionFilter.set('');this.statusFilter.set('');this.load();}
 countStatus(status:CourseOfferingStatus):number{return this.offerings().filter(o=>this.statusValue(o)===status).length;}
 courseName(id:string):string{return this.courses().find(x=>x.id===id)?.title??'Course details unavailable';}
 courseCode(id:string):string{return this.courses().find(x=>x.id===id)?.code??id;}
 creditHours(id:string):number|string{return this.courses().find(x=>x.id===id)?.creditHours??'—';}
 sessionName(id:string):string{return this.sessions().find(x=>x.id===id)?.name??'Session details unavailable';}
 sessionCode(id:string):string{return this.sessions().find(x=>x.id===id)?.code??id;}
 statusValue(o:CourseOffering):CourseOfferingStatus{return offeringStatusValue(o.status);}
 statusLabel(o:CourseOffering):string{return offeringStatusLabel(o.status);}
 statusClass(o:CourseOffering):string{return offeringStatusClass(o.status);}
 capacityPercent(o:CourseOffering):number{return o.capacity?Math.min(100,Math.round(o.enrolledCount/o.capacity*100)):0;}
 openCreate():void{this.editingId.set(null);this.form.reset({courseId:'',academicSessionId:'',section:'',capacity:30,instructorEmployeeId:''});this.formOpen.set(true);}
 openEdit(o:CourseOffering):void{this.editingId.set(o.id);this.form.reset({courseId:o.courseId,academicSessionId:o.academicSessionId,section:o.section,capacity:o.capacity,instructorEmployeeId:o.instructorEmployeeId??''});this.formOpen.set(true);}
 closeForm():void{if(!this.saving())this.formOpen.set(false);}
 save():void{if(this.form.invalid){this.form.markAllAsTouched();return;}this.saving.set(true);const v=this.form.getRawValue();const id=this.editingId();
 const request:Observable<unknown>=id?this.api.updateOffering(id,{capacity:v.capacity,instructorEmployeeId:v.instructorEmployeeId.trim()||null}):this.api.createOffering({courseId:v.courseId,academicSessionId:v.academicSessionId,section:v.section.trim().toUpperCase(),capacity:v.capacity,instructorEmployeeId:v.instructorEmployeeId.trim()||null} satisfies CreateCourseOfferingRequest);
 request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.saving.set(false);this.formOpen.set(false);this.notices.show(id?'Course offering updated.':'Course offering created.','success');this.load();},error:e=>{this.saving.set(false);this.notices.show(this.apiError(e,'Course offering could not be saved.'),'error');}});
 }
 async transition(o:CourseOffering,action:'publish'|'close'|'cancel'):Promise<void>{const labels={publish:'Publish',close:'Close',cancel:'Cancel'};const messages={publish:'Publishing makes this section available for student enrollment.',close:'Closing stops further enrollment while preserving existing registrations.',cancel:'Cancelling this offering may affect enrolled students.'};const ok=await this.confirmation.confirm(messages[action],{title:labels[action]+' course offering?',confirmText:labels[action],danger:action==='cancel'});if(!ok)return;const call=action==='publish'?this.api.publish(o.id):action==='close'?this.api.close(o.id):this.api.cancel(o.id);call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.notices.show('Course offering '+(action==='publish'?'published':action==='close'?'closed':'cancelled')+'.','success');this.load();},error:e=>this.notices.show(this.apiError(e,'The offering status could not be changed.'),'error')});}
 private apiError(error:unknown,fallback:string):string{const e=error as HttpErrorResponse;return e.error?.detail??e.error?.title??(e.status===403?'Your account does not have CourseOfferings.Management permission.':e.status===409?'This operation conflicts with the current offering or enrollment state.':fallback);}
}
