import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';
import { AcademicCatalogService } from '../academic-catalog/academic-catalog.service';
import { Course, AcademicSession } from '../academic-catalog/academic-catalog.models';
import { StudentsService } from '../students/students.service';
import { Student, StudentPage, StudentStatus } from '../students/students.models';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';
import { CourseOfferingsService } from './course-offerings.service';
import { CourseEnrollment, CourseOffering, CourseOfferingStatus, EnrollmentStatus, TimetableEntry, TeachingRoom, enrollmentStatusLabel, enrollmentStatusValue, offeringStatusClass, offeringStatusLabel, offeringStatusValue, timetableStatusLabel } from './course-offerings.models';

interface TimetableView { entry:TimetableEntry; room:TeachingRoom|null; }
@Component({
 selector:'app-course-offering-details',standalone:true,imports:[ReactiveFormsModule,DatePipe,RouterLink],
 template:`
 <section class="container-fluid px-0">
  <div class="d-flex flex-wrap align-items-center gap-2 mb-3"><a routerLink="/course-offerings" class="btn btn-sm btn-outline-secondary">← Offerings</a><span class="text-secondary small">Academic catalog / Course offerings</span></div>
  @if(error()){<div class="alert alert-danger" role="alert">{{error()}} <button class="btn btn-sm btn-outline-danger ms-2" type="button" (click)="load()">Retry</button></div>}
  @if(loading()){<div class="card border-0 shadow-sm"><div class="card-body text-center py-5"><span class="spinner-border spinner-border-sm me-2"></span>Loading course offering…</div></div>}
  @else if(offering();as o){
   <header class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><div class="d-flex align-items-center gap-2 mb-2"><span class="badge rounded-pill" [class]="statusClass()">{{statusLabel()}}</span><span class="small text-secondary font-monospace">{{o.section}}</span></div><h1 class="h3 fw-bold mb-1">{{course()?.code??'Course'}} · {{course()?.title??'Offering details'}}</h1><p class="text-secondary mb-0">{{session()?.name??'Academic session'}} <span class="mx-1">·</span> Section {{o.section}}</p></div>
    <div class="d-flex flex-wrap gap-2">@if(statusValue()===draft){<button class="btn btn-outline-success" type="button" (click)="transition('publish')">Publish offering</button>}@if(statusValue()===published){<button class="btn btn-outline-primary" type="button" (click)="transition('close')">Close offering</button>}@if(statusValue()===draft||statusValue()===published){<button class="btn btn-outline-danger" type="button" (click)="transition('cancel')">Cancel offering</button>}</div>
   </header>
   <div class="row g-3 mb-4">
    <div class="col-6 col-xl-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-secondary">Credit hours</div><div class="h3 fw-bold mb-0">{{course()?.creditHours??'—'}}</div></div></div></div>
    <div class="col-6 col-xl-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-secondary">Enrolled students</div><div class="h3 fw-bold mb-0">{{o.enrolledCount}}</div></div></div></div>
    <div class="col-6 col-xl-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-secondary">Section capacity</div><div class="h3 fw-bold mb-0">{{o.capacity}}</div></div></div></div>
    <div class="col-6 col-xl-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="small text-secondary">Available seats</div><div class="h3 fw-bold mb-0">{{Math.max(0,o.capacity-o.enrolledCount)}}</div></div></div></div>
   </div>
   <div class="card border-0 shadow-sm">
    <div class="card-header bg-white border-bottom-0 pt-3 px-3"><ul class="nav nav-tabs card-header-tabs" role="tablist">
     <li class="nav-item"><button class="nav-link" [class.active]="activeTab()==='overview'" type="button" (click)="activeTab.set('overview')">Overview</button></li>
     <li class="nav-item"><button class="nav-link" [class.active]="activeTab()==='students'" type="button" (click)="activeTab.set('students');loadEnrollments()">Students <span class="badge text-bg-light ms-1">{{o.enrolledCount}}</span></button></li>
     <li class="nav-item"><button class="nav-link" [class.active]="activeTab()==='timetable'" type="button" (click)="activeTab.set('timetable');loadTimetable()">Timetable</button></li>
    </ul></div>
    <div class="card-body p-4">
     @if(activeTab()==='overview'){<div class="row g-4"><div class="col-12 col-lg-7"><h2 class="h6 fw-bold mb-3">Offering information</h2><dl class="row mb-0">
      <dt class="col-sm-5 text-secondary fw-normal mb-2">Course</dt><dd class="col-sm-7 fw-semibold">{{course()?.code??o.courseId}} — {{course()?.title??'Unavailable'}}</dd>
      <dt class="col-sm-5 text-secondary fw-normal mb-2">Academic session</dt><dd class="col-sm-7 fw-semibold">{{session()?.name??o.academicSessionId}}</dd>
      <dt class="col-sm-5 text-secondary fw-normal mb-2">Section</dt><dd class="col-sm-7 fw-semibold">{{o.section}}</dd>
      <dt class="col-sm-5 text-secondary fw-normal mb-2">Credit hours</dt><dd class="col-sm-7 fw-semibold">{{course()?.creditHours??'—'}}</dd>
      <dt class="col-sm-5 text-secondary fw-normal mb-2">Instructor employee ID</dt><dd class="col-sm-7 font-monospace small">{{o.instructorEmployeeId??'Not assigned'}}</dd>
      <dt class="col-sm-5 text-secondary fw-normal mb-2">Offering status</dt><dd class="col-sm-7"><span class="badge rounded-pill" [class]="statusClass()">{{statusLabel()}}</span></dd>
     </dl></div><div class="col-12 col-lg-5"><h2 class="h6 fw-bold mb-3">Enrollment capacity</h2><div class="d-flex justify-content-between small mb-2"><span class="text-secondary">Seats filled</span><strong>{{o.enrolledCount}} / {{o.capacity}}</strong></div><div class="progress mb-3" style="height:9px"><div class="progress-bar" [style.width.%]="capacityPercent()"></div></div><p class="small text-secondary mb-0">{{Math.max(0,o.capacity-o.enrolledCount)}} seats currently available. Only published offerings accept new enrollments.</p></div></div>}
     @if(activeTab()==='students'){<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><div><h2 class="h6 fw-bold mb-1">Student enrollments</h2><p class="small text-secondary mb-0">Manage registrations for this course section.</p></div><button class="btn btn-sm btn-outline-secondary" type="button" (click)="loadEnrollments()" [disabled]="enrollmentLoading()">Refresh</button></div>
      @if(statusValue()===published){<form [formGroup]="searchForm" (ngSubmit)="searchStudents()" class="row g-2 align-items-end p-3 rounded bg-light mb-3">
       <div class="col-12 col-md-6"><label class="form-label" for="student-enrollment-search">Find student</label><input id="student-enrollment-search" class="form-control" formControlName="search" placeholder="Registration number, name or email"></div>
       <div class="col-12 col-md-3"><label class="form-label" for="enrolled-on">Enrollment date</label><input id="enrolled-on" class="form-control" type="date" formControlName="enrolledOn"></div>
       <div class="col-12 col-md-3"><button class="btn btn-primary w-100" type="submit" [disabled]="studentSearchLoading()">Search students</button></div>
      </form>
      @if(studentSearchError()){<div class="alert alert-warning small">{{studentSearchError()}}</div>}
      @if(studentResults().length){<div class="list-group mb-3">@for(s of studentResults();track s.id){<div class="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2"><div><div class="fw-semibold">{{s.fullName}}</div><div class="small text-secondary">{{s.registrationNumber}} · {{s.email}}</div></div><button class="btn btn-sm btn-outline-primary" type="button" (click)="enroll(s)" [disabled]="enrolling()||!isActiveStudent(s)">Enroll student</button></div>}</div>}
      }
      @if(enrollmentError()){<div class="alert alert-danger small">{{enrollmentError()}}</div>}
      @if(enrollmentLoading()){<div class="text-center text-secondary py-4"><span class="spinner-border spinner-border-sm me-2"></span>Loading enrollments…</div>}
      @else{<div class="table-responsive"><table class="table table-hover align-middle"><thead class="table-light"><tr><th>Student</th><th>Registration no.</th><th>Enrolled on</th><th>Status</th><th class="text-end">Actions</th></tr></thead><tbody>
       @for(e of enrollments();track e.id){<tr><td><div class="fw-semibold">{{studentName(e.studentId)}}</div><div class="small text-secondary font-monospace">{{e.studentId}}</div></td><td>{{studentRegistration(e.studentId)}}</td><td>{{e.enrolledOn|date:'mediumDate'}}</td><td><span class="badge rounded-pill" [class.text-bg-success]="enrollmentStatus(e)===enrolled" [class.text-bg-secondary]="enrollmentStatus(e)===dropped" [class.text-bg-primary]="enrollmentStatus(e)===completed" [class.text-bg-warning]="enrollmentStatus(e)===withdrawn">{{enrollmentLabel(e)}}</span></td>
        <td class="text-end"><div class="d-inline-flex gap-1">@if(enrollmentStatus(e)===enrolled){<button class="btn btn-sm btn-outline-secondary" type="button" (click)="changeEnrollment(e,'drop')">Drop</button><button class="btn btn-sm btn-outline-warning" type="button" (click)="changeEnrollment(e,'withdraw')">Withdraw</button><button class="btn btn-sm btn-outline-success" type="button" (click)="changeEnrollment(e,'complete')">Complete</button>}</div></td></tr>}
       @empty{<tr><td colspan="5" class="text-center text-secondary py-5">No enrollment records found for this offering.</td></tr>}
      </tbody></table></div>}
     }
     @if(activeTab()==='timetable'){<div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="h6 fw-bold mb-1">Teaching timetable</h2><p class="small text-secondary mb-0">Schedule entries linked to this offering.</p></div><button class="btn btn-sm btn-outline-secondary" type="button" (click)="loadTimetable()" [disabled]="timetableLoading()">Refresh</button></div>
      @if(timetableError()){<div class="alert alert-warning small" role="alert">{{timetableError()}} Timetable access is controlled separately by Timetable.Management.</div>}
      @if(timetableLoading()){<div class="text-center text-secondary py-4"><span class="spinner-border spinner-border-sm me-2"></span>Loading timetable…</div>}
      @else if(timetableRows().length){<div class="table-responsive"><table class="table table-hover align-middle"><thead class="table-light"><tr><th>Day</th><th>Time</th><th>Room</th><th>Effective period</th><th>Status</th></tr></thead><tbody>@for(row of timetableRows();track row.entry.id){<tr><td class="fw-semibold">{{dayLabel(row.entry.dayOfWeek)}}</td><td>{{row.entry.startTime}} – {{row.entry.endTime}}</td><td>{{row.room?.code??row.entry.roomId}} <span class="small text-secondary">{{row.room?.name??''}}</span></td><td>{{row.entry.effectiveFrom|date:'mediumDate'}} – {{row.entry.effectiveTo|date:'mediumDate'}}</td><td><span class="badge text-bg-light">{{timetableStatusLabel(row.entry.status)}}</span></td></tr>}</tbody></table></div>}
      @else if(!timetableError()){<div class="text-center text-secondary py-5">No timetable entries are currently scheduled for this offering.</div>}
     }
    </div>
   </div>
  }
 </section>
 `
})
export class CourseOfferingDetailsPage implements OnInit {
 private readonly route=inject(ActivatedRoute);private readonly api=inject(CourseOfferingsService);private readonly catalog=inject(AcademicCatalogService);private readonly students=inject(StudentsService);private readonly fb=inject(FormBuilder);private readonly destroyRef=inject(DestroyRef);private readonly confirm=inject(ConfirmationService);private readonly notices=inject(NotificationService);
 readonly Math=Math;readonly id=this.route.snapshot.paramMap.get('id')??'';
 readonly offering=signal<CourseOffering|null>(null);readonly course=signal<Course|null>(null);readonly session=signal<AcademicSession|null>(null);
 readonly loading=signal(false);readonly error=signal<string|null>(null);readonly activeTab=signal<'overview'|'students'|'timetable'>('overview');
 readonly enrollments=signal<CourseEnrollment[]>([]);readonly enrollmentLoading=signal(false);readonly enrollmentError=signal<string|null>(null);readonly studentLabels=signal<Record<string,Student>>({});
 readonly studentResults=signal<Student[]>([]);readonly studentSearchLoading=signal(false);readonly studentSearchError=signal<string|null>(null);readonly enrolling=signal(false);
 readonly timetableRows=signal<TimetableView[]>([]);readonly timetableLoading=signal(false);readonly timetableError=signal<string|null>(null);
 readonly draft=CourseOfferingStatus.Draft;readonly published=CourseOfferingStatus.Published;readonly enrolled=EnrollmentStatus.Enrolled;readonly dropped=EnrollmentStatus.Dropped;readonly completed=EnrollmentStatus.Completed;readonly withdrawn=EnrollmentStatus.Withdrawn;
 readonly searchForm=this.fb.nonNullable.group({search:['',[Validators.required,Validators.minLength(2)]],enrolledOn:[new Date().toISOString().slice(0,10),Validators.required]});
 ngOnInit():void{this.load();}
 load():void{if(!this.id){this.error.set('A course offering ID is required.');return;}this.loading.set(true);this.error.set(null);this.api.getOffering(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:o=>{this.offering.set(o);this.loading.set(false);this.catalog.getCourse(o.courseId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:c=>this.course.set(c),error:()=>this.course.set(null)});this.catalog.getSession(o.academicSessionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:s=>this.session.set(s),error:()=>this.session.set(null)});},error:e=>{this.error.set(this.apiError(e,'Course offering details could not be loaded.'));this.loading.set(false);}});}
 statusValue():CourseOfferingStatus{return offeringStatusValue(this.offering()?.status??1);}
 statusLabel():string{return offeringStatusLabel(this.offering()?.status??1);}
 statusClass():string{return offeringStatusClass(this.offering()?.status??1);}
 capacityPercent():number{const o=this.offering();return o?.capacity?Math.min(100,Math.round(o.enrolledCount/o.capacity*100)):0;}
 async transition(action:'publish'|'close'|'cancel'):Promise<void>{const labels={publish:'Publish',close:'Close',cancel:'Cancel'};const messages={publish:'This section will become available for student enrollment.',close:'Closing prevents new registrations while preserving current enrollment records.',cancel:'Cancelling may impact every student registered in this section.'};if(!await this.confirm.confirm(messages[action],{title:labels[action]+' offering?',confirmText:labels[action],danger:action==='cancel'}))return;const call=action==='publish'?this.api.publish(this.id):action==='close'?this.api.close(this.id):this.api.cancel(this.id);call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.notices.show('Offering '+(action==='publish'?'published':action==='close'?'closed':'cancelled')+'.','success');this.load();},error:e=>this.notices.show(this.apiError(e,'Offering status could not be changed.'),'error')});}
 loadEnrollments():void{this.enrollmentLoading.set(true);this.enrollmentError.set(null);this.api.getEnrollments(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:rows=>{this.enrollments.set(rows);this.enrollmentLoading.set(false);this.loadStudentLabels(rows);},error:e=>{this.enrollmentError.set(this.apiError(e,'Enrollment records could not be loaded.'));this.enrollmentLoading.set(false);}});}
 private loadStudentLabels(rows:CourseEnrollment[]):void{const missing=[...new Set(rows.map(x=>x.studentId).filter(id=>!this.studentLabels()[id]))];if(!missing.length)return;from(missing).pipe(mergeMap(id=>this.students.getStudent(id).pipe(catchError(()=>of(null))),4),toArray(),takeUntilDestroyed(this.destroyRef)).subscribe(results=>{const next={...this.studentLabels()};for(const student of results)if(student)next[student.id]=student;this.studentLabels.set(next);});}
 studentName(id:string):string{return this.studentLabels()[id]?.fullName??'Student record unavailable';}
 studentRegistration(id:string):string{return this.studentLabels()[id]?.registrationNumber??'—';}
 searchStudents():void{if(this.searchForm.invalid){this.searchForm.controls.search.markAsTouched();return;}this.studentSearchLoading.set(true);this.studentSearchError.set(null);this.studentResults.set([]);const term=this.searchForm.controls.search.value.trim();this.students.getStudents({page:1,pageSize:10,search:term,sortBy:'registrationNumber',sortDirection:'asc'}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:(page:StudentPage)=>{this.studentResults.set(page.items);this.studentSearchLoading.set(false);if(!page.items.length)this.studentSearchError.set('No students matched this search.');},error:e=>{this.studentSearchLoading.set(false);this.studentSearchError.set(e.status===403?'Student lookup requires students.manage permission. Ask an administrator to grant access.':this.apiError(e,'Student lookup failed.'));}});}
 isActiveStudent(s:Student):boolean{return Number(s.status)===StudentStatus.Active;}
 enroll(s:Student):void{if(!this.isActiveStudent(s)){this.notices.show('Only active students can be enrolled.','error');return;}if(this.enrolling())return;this.enrolling.set(true);this.api.enrollStudent(this.id,s.id,{enrolledOn:this.searchForm.controls.enrolledOn.value}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.enrolling.set(false);this.notices.show(s.fullName+' enrolled successfully.','success');this.studentResults.update(rows=>rows.filter(x=>x.id!==s.id));this.load();this.loadEnrollments();},error:e=>{this.enrolling.set(false);this.notices.show(this.apiError(e,'Student could not be enrolled. Verify offering status, capacity and duplicate registration.'),'error');}});}
 async changeEnrollment(e:CourseEnrollment,action:'drop'|'withdraw'|'complete'):Promise<void>{const labels={drop:'Drop',withdraw:'Withdraw',complete:'Complete'};const messages={drop:'This releases the seat for another student.',withdraw:'This records a withdrawal from the course offering.',complete:'Mark this enrollment as completed?'};if(!await this.confirm.confirm(messages[action],{title:labels[action]+' enrollment?',confirmText:labels[action],danger:action!=='complete'}))return;const call=action==='drop'?this.api.dropEnrollment(e.id):action==='withdraw'?this.api.withdrawEnrollment(e.id):this.api.completeEnrollment(e.id);call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.notices.show('Enrollment '+(action==='drop'?'dropped':action==='withdraw'?'withdrawn':'completed')+'.','success');this.load();this.loadEnrollments();},error:err=>this.notices.show(this.apiError(err,'Enrollment status could not be changed.'),'error')});}
 loadTimetable():void{this.timetableLoading.set(true);this.timetableError.set(null);this.timetableRows.set([]);this.api.getTimetableEntries(this.id).pipe(switchMap(entries=>from(entries).pipe(mergeMap(entry=>this.api.getRoom(entry.roomId).pipe(map(room=>({entry,room} as TimetableView)),catchError(()=>of({entry,room:null} as TimetableView))),4),toArray())),takeUntilDestroyed(this.destroyRef)).subscribe({next:rows=>{this.timetableRows.set(rows);this.timetableLoading.set(false);},error:e=>{this.timetableLoading.set(false);this.timetableError.set(this.apiError(e,'Timetable entries could not be loaded.'));}});}
 enrollmentStatus(e:CourseEnrollment):EnrollmentStatus{return enrollmentStatusValue(e.status);}
 enrollmentLabel(e:CourseEnrollment):string{return enrollmentStatusLabel(e.status);}
 dayLabel(value:number|string):string{const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];const n=typeof value==='number'?value:days.findIndex(x=>x.toLowerCase()===String(value).toLowerCase());return days[n]??String(value);}
 timetableStatusLabel(value:number|string):string{return timetableStatusLabel(value);}
 private apiError(error:unknown,fallback:string):string{const e=error as HttpErrorResponse;return e.error?.detail??e.error?.title??(e.status===403?'Your account does not have permission to access this resource.':e.status===409?'This action conflicts with the current offering or enrollment state.':fallback);}
}
