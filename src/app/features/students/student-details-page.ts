import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';
import { canAccess } from '../../core/auth/access';
import { AuthService } from '../../core/services/auth.service';
import { AcademicStructureService } from '../academic-structure/academic-structure.service';
import { AcademicProgram } from '../academic-structure/academic-structure.models';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';
import { Student, StudentAttendanceRow, ExaminationResult, StudentFeeAccount, StudentStatus, CourseOffering, studentStatusLabel } from './students.models';
import { StudentsService } from './students.service';
import { StudentStatusBadge } from './student-status-badge';

type StudentTab='personal'|'registration'|'program'|'records'|'attendance'|'examinations'|'fees';
@Component({selector:'app-student-details-page',standalone:true,imports:[CommonModule,RouterLink,FormsModule,DatePipe,DecimalPipe,CurrencyPipe,StudentStatusBadge],
 template:`
 <section class="container-fluid py-3 student-module">
  <div class="mb-3"><a routerLink="/students" class="small text-decoration-none">← Student directory</a></div>
  @if(loading()){<div class="card border-0 shadow-sm"><div class="card-body text-center py-5"><span class="spinner-border spinner-border-sm me-2"></span>Loading student profile…</div></div>}
  @else if(error()){<div class="alert alert-danger">{{error()}} <a routerLink="/students" class="alert-link ms-2">Return to directory</a></div>}
  @else if(student();as s){
   <header class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><div class="text-uppercase small fw-semibold text-primary mb-1">STUDENT PROFILE</div><h1 class="h3 mb-1">{{s.fullName}}</h1><div class="d-flex flex-wrap align-items-center gap-2"><span class="text-muted">{{s.registrationNumber}}</span><app-student-status-badge [status]="s.status"/></div></div><div class="d-flex flex-wrap gap-2"><a class="btn btn-outline-primary" [routerLink]="['/students',s.id,'edit']">Edit profile</a>@if(s.status===StudentStatus.Active){<button class="btn btn-outline-warning" (click)="changeStatus('suspend')">Suspend</button><button class="btn btn-outline-danger" (click)="changeStatus('withdraw')">Withdraw</button><button class="btn btn-outline-success" (click)="changeStatus('graduate')">Graduate</button>}@else if(s.status===StudentStatus.Suspended){<button class="btn btn-outline-success" (click)="changeStatus('reactivate')">Reactivate</button><button class="btn btn-outline-danger" (click)="changeStatus('withdraw')">Withdraw</button>}</div></header>
   <div class="card border-0 shadow-sm">
    <div class="card-header bg-white p-0"><nav class="nav nav-tabs flex-nowrap overflow-auto px-3 pt-2" aria-label="Student profile sections">
     @for(t of visibleTabs();track t.id){<button class="nav-link text-nowrap" type="button" [class.active]="activeTab()===t.id" (click)="selectTab(t.id)">{{t.label}}</button>}
    </nav></div>
    <div class="card-body p-3 p-lg-4">
     @if(activeTab()==='personal'){<div class="d-flex justify-content-between align-items-center mb-3"><h2 class="h5 mb-0">Personal information</h2><a class="btn btn-sm btn-outline-primary" [routerLink]="['/students',s.id,'edit']">Edit information</a></div><div class="row g-3"><div class="col-md-6"><div class="text-muted small">Full name</div><strong>{{s.fullName}}</strong></div><div class="col-md-6"><div class="text-muted small">Email address</div><strong>{{s.email}}</strong></div><div class="col-md-6"><div class="text-muted small">Phone number</div><strong>{{s.phoneNumber||'Not provided'}}</strong></div><div class="col-md-6"><div class="text-muted small">Current status</div><app-student-status-badge [status]="s.status"/></div></div>
      @if(s.statusHistory?.length){<hr><h3 class="h6">Academic status history</h3><ul class="list-group list-group-flush">@for(item of s.statusHistory;track $index){<li class="list-group-item px-0 d-flex justify-content-between"><span>{{statusLabel(item.status)}} @if(item.remarks){<small class="text-muted d-block">{{item.remarks}}</small>}</span><span class="small text-muted">{{item.occurredAtUtc|date:'medium'}}</span></li>}</ul>}}
     @if(activeTab()==='registration'){<h2 class="h5 mb-3">Registration information</h2><div class="row g-3"><div class="col-md-6"><div class="text-muted small">Registration number</div><strong>{{s.registrationNumber}}</strong></div><div class="col-md-6"><div class="text-muted small">Enrollment date</div><strong>{{s.enrollmentDate|date:'longDate'}}</strong></div><div class="col-md-6"><div class="text-muted small">Record created</div><strong>{{s.createdAtUtc|date:'medium'}}</strong></div><div class="col-md-6"><div class="text-muted small">Last updated</div><strong>{{s.updatedAtUtc?(s.updatedAtUtc|date:'medium'):'Never'}}</strong></div></div>}
     @if(activeTab()==='program'){<h2 class="h5 mb-3">Academic program</h2><div class="mb-3"><div class="text-muted small">Current program</div><strong>{{programName(s.academicProgramId)}}</strong><div class="small text-muted text-break">{{s.academicProgramId}}</div></div><form class="row g-2 align-items-end" (ngSubmit)="changeProgram()"><div class="col-md-8"><label class="form-label">Change to active program</label><select class="form-select" name="newProgram" [(ngModel)]="newProgramId"><option value="">Select a program</option>@for(p of activePrograms();track p.id){<option [value]="p.id">{{p.name}} ({{p.code}})</option>}</select>@if(programError()){<div class="form-text text-warning">{{programError()}}</div>}</div><div class="col-md-4"><button class="btn btn-primary" type="submit" [disabled]="!newProgramId||newProgramId===s.academicProgramId||programSaving()">Change program</button></div></form>}
     @if(activeTab()==='records'){<h2 class="h5">Academic records</h2><div class="alert alert-info mt-3 mb-0"><strong>Student-specific records endpoint is not available for staff queries.</strong><p class="mb-0 small mt-1">The existing transcript API is scoped to the authenticated Student account (/api/v1/academic-records/me/transcripts). It is not safe to use it to retrieve another student's records by email or guessed identity. This tab will populate when a studentId-scoped academic-records endpoint is exposed.</p></div>}
     @if(activeTab()==='attendance'){<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><h2 class="h5 mb-0">Attendance</h2><button class="btn btn-sm btn-outline-secondary" (click)="loadAttendance()" [disabled]="attendanceLoading()">Refresh</button></div>
      @if(attendanceLoading()){<p class="text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading enrolled course attendance…</p>}@else if(attendanceError()){<div class="alert alert-warning">{{attendanceError()}}</div>}@else if(attendanceRows().length){<div class="table-responsive"><table class="table table-hover align-middle"><thead class="table-light"><tr><th>Course offering</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th>Attendance</th></tr></thead><tbody>@for(row of attendanceRows();track row.offeringId){<tr><td><div class="fw-semibold">{{row.section}}</div><small class="text-muted">{{row.offeringId}}</small></td><td>{{row.presentCount}}</td><td>{{row.absentCount}}</td><td>{{row.lateCount}}</td><td>{{row.excusedCount}}</td><td>@if(row.attendancePercentage!==null){<span [class.text-danger]="row.isBelowRequiredPercentage" [class.text-success]="!row.isBelowRequiredPercentage">{{row.attendancePercentage|number:'1.1-2'}}%</span>}@else{—}</td></tr>}</tbody></table></div>}@else{<div class="text-muted py-4 text-center">No published attendance reports were found for this student's enrolled offerings.</div>}}
     @if(activeTab()==='examinations'){<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><h2 class="h5 mb-0">Examination results</h2><button class="btn btn-sm btn-outline-secondary" (click)="loadExaminations()" [disabled]="examLoading()">Refresh</button></div>
      @if(examLoading()){<p class="text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading published examination results…</p>}@else if(examError()){<div class="alert alert-warning">{{examError()}}</div>}@else if(examRows().length){<div class="table-responsive"><table class="table table-hover align-middle"><thead class="table-light"><tr><th>Examination</th><th>Scheduled</th><th>Marks</th><th>Maximum</th><th>Result</th></tr></thead><tbody>@for(row of examRows();track row.examId){<tr><td><div class="fw-semibold">{{row.title}}</div><small class="text-muted">{{row.offeringId}}</small></td><td>{{row.scheduledDate|date:'mediumDate'}}</td><td>{{row.marksObtained|number:'1.0-2'}}</td><td>{{row.maximumMarks|number:'1.0-2'}}</td><td><span class="badge" [class.text-bg-success]="row.isPassed" [class.text-bg-danger]="!row.isPassed">{{row.isPassed?'Passed':'Not passed'}}</span></td></tr>}</tbody></table></div>}@else{<div class="text-muted py-4 text-center">No published examination results were found for this student.</div>}}
     @if(activeTab()==='fees'){<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><h2 class="h5 mb-0">Fee account</h2><button class="btn btn-sm btn-outline-secondary" (click)="loadFees()" [disabled]="feeLoading()">Refresh</button></div>
      @if(feeLoading()){<p class="text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading fee account…</p>}@else if(feeError()){<div class="alert alert-warning">{{feeError()}}</div>}@else if(feeAccount();as account){<div class="rounded bg-light p-3 mb-3"><div class="text-muted small">Total outstanding</div><div class="h3 mb-0">{{account.totalOutstanding|currency:'PKR':'symbol':'1.2-2'}}</div></div><h3 class="h6">Fee challans</h3><div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Challan</th><th>Issue date</th><th>Due date</th><th>Total</th><th>Status</th></tr></thead><tbody>@for(c of account.challans;track c.id){<tr><td>{{c.challanNumber}}</td><td>{{c.issueDate|date:'mediumDate'}}</td><td>{{c.dueDate|date:'mediumDate'}}</td><td>{{c.totalAmount|currency:c.currencyCode:'symbol':'1.2-2'}}</td><td>{{c.status}}</td></tr>}@empty{<tr><td colspan="5" class="text-center text-muted py-3">No fee challans.</td></tr>}</tbody></table></div><h3 class="h6 mt-4">Payments</h3><div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>Reference</th><th>Method</th><th>Amount</th><th>Status</th><th>Verified</th></tr></thead><tbody>@for(p of account.payments;track p.id){<tr><td>{{p.referenceNumber}}</td><td>{{p.method}}</td><td>{{p.amount|currency:'PKR':'symbol':'1.2-2'}}</td><td>{{p.status}}</td><td>{{p.verifiedAtUtc?(p.verifiedAtUtc|date:'mediumDate'):'Pending'}}</td></tr>}@empty{<tr><td colspan="5" class="text-center text-muted py-3">No payments recorded.</td></tr>}</tbody></table></div>}}
    </div>
   </div>
  }
 </section>`})
export class StudentDetailsPage implements OnInit {
 private readonly route=inject(ActivatedRoute);private readonly service=inject(StudentsService);private readonly structure=inject(AcademicStructureService);private readonly confirm=inject(ConfirmationService);private readonly notices=inject(NotificationService);private readonly auth=inject(AuthService);
 readonly StudentStatus=StudentStatus;private readonly tabs:{id:StudentTab;label:string}[]=[{id:'personal',label:'Personal information'},{id:'registration',label:'Registration'},{id:'program',label:'Academic program'},{id:'records',label:'Academic records'},{id:'attendance',label:'Attendance'},{id:'examinations',label:'Examination results'},{id:'fees',label:'Fee account'}];
 visibleTabs(){return this.tabs.filter(tab=>tab.id!=='fees'||canAccess(this.auth.currentUser(),['finance.read']));}
 readonly student=signal<Student|null>(null);readonly loading=signal(true);readonly error=signal<string|null>(null);readonly activeTab=signal<StudentTab>('personal');
 readonly programs=signal<AcademicProgram[]>([]);readonly activePrograms=signal<AcademicProgram[]>([]);readonly programError=signal<string|null>(null);newProgramId='';readonly programSaving=signal(false);
 readonly attendanceLoading=signal(false);readonly attendanceError=signal<string|null>(null);readonly attendanceRows=signal<(StudentAttendanceRow&{offeringId:string;section:string})[]>([]);
 readonly examLoading=signal(false);readonly examError=signal<string|null>(null);readonly examRows=signal<(ExaminationResult&{examId:string;title:string;scheduledDate:string;maximumMarks:number;offeringId:string})[]>([]);
 readonly feeLoading=signal(false);readonly feeError=signal<string|null>(null);readonly feeAccount=signal<StudentFeeAccount|null>(null);
 private readonly id=this.route.snapshot.paramMap.get('id')!;
 ngOnInit():void{this.load();this.structure.getPrograms().subscribe({next:p=>{this.programs.set(p);this.activePrograms.set(p.filter(x=>x.isActive));},error:()=>this.programError.set('Program lookup is not available for this account.')});}
 load():void{this.loading.set(true);this.service.getStudent(this.id).subscribe({next:s=>{this.student.set(s);this.loading.set(false);},error:e=>{this.error.set(e.error?.detail??'Student profile could not be loaded.');this.loading.set(false);}});}
 selectTab(tab:StudentTab):void{this.activeTab.set(tab);if(tab==='attendance'&&!this.attendanceRows().length&&!this.attendanceError())this.loadAttendance();if(tab==='examinations'&&!this.examRows().length&&!this.examError())this.loadExaminations();if(tab==='fees'&&!this.feeAccount()&&!this.feeError())this.loadFees();}
 programName(id:string):string{return this.programs().find(x=>x.id===id)?.name??'Program name unavailable';}
 statusLabel(status:number):string{return studentStatusLabel(status);}
 changeProgram():void{if(!this.newProgramId||this.programSaving())return;void this.confirm.confirm('Changing a student’s academic program may affect their academic pathway. Continue?',{title:'Change academic program',confirmText:'Change program',danger:true}).then(ok=>{if(!ok)return;this.programSaving.set(true);this.service.changeProgram(this.id,{academicProgramId:this.newProgramId}).subscribe({next:()=>{this.programSaving.set(false);this.newProgramId='';this.notices.show('Academic program changed.','success');this.load();},error:e=>{this.programSaving.set(false);this.notices.show(e.error?.detail??'Program change was rejected.','error');}});});}
 changeStatus(action:'suspend'|'reactivate'|'graduate'|'withdraw'):void{const labels={suspend:'Suspend student',reactivate:'Reactivate student',graduate:'Graduate student',withdraw:'Withdraw student'};const messages={suspend:'The student will be marked as suspended.',reactivate:'The student will return to active standing.',graduate:'This will mark the student as graduated.',withdraw:'This will mark the student as withdrawn.'};void this.confirm.confirm(messages[action],{title:labels[action],confirmText:labels[action],danger:action!=='reactivate'}).then(ok=>{if(!ok)return;const request=action==='suspend'?this.service.suspend(this.id):action==='reactivate'?this.service.reactivate(this.id):action==='graduate'?this.service.graduate(this.id):this.service.withdraw(this.id);request.subscribe({next:()=>{this.notices.show(labels[action]+' completed.','success');this.load();},error:e=>this.notices.show(e.error?.detail??'The status transition was rejected by the API.','error')});});}
 loadFees():void{this.feeLoading.set(true);this.feeError.set(null);this.service.getFeeAccount(this.id).subscribe({next:x=>{this.feeAccount.set(x);this.feeLoading.set(false);},error:e=>{this.feeError.set(e.error?.detail??'Fee account is unavailable. Check finance permissions.');this.feeLoading.set(false);}});}
 loadAttendance():void{this.attendanceLoading.set(true);this.attendanceError.set(null);this.studentOfferings().pipe(switchMap(offerings=>from(offerings).pipe(mergeMap(offering=>this.service.getAttendanceReport(offering.id).pipe(map(report=>{const row=report.students.find(x=>x.studentId===this.id);return row?{...row,offeringId:offering.id,section:offering.section}:null;}),catchError(()=>of(null))),4),toArray()))).subscribe({next:rows=>{this.attendanceRows.set(rows.filter((x):x is StudentAttendanceRow&{offeringId:string;section:string}=>x!==null));this.attendanceLoading.set(false);},error:e=>{this.attendanceError.set(e.error?.detail??'Attendance could not be loaded. This view requires course-offering and attendance-report permissions.');this.attendanceLoading.set(false);}});}
 loadExaminations():void{
  this.examLoading.set(true);this.examError.set(null);
  this.studentOfferings().pipe(
   switchMap(offerings=>from(offerings).pipe(
    mergeMap(offering=>this.getPublishedResultsForOffering(offering),3),
    toArray(),
    map(groups=>groups.flat())
   ))
  ).subscribe({
   next:rows=>{this.examRows.set(rows);this.examLoading.set(false);},
   error:e=>{this.examError.set(e.error?.detail??'Examination results could not be loaded. Check course-offering and examination permissions.');this.examLoading.set(false);}
  });
 }
 private getPublishedResultsForOffering(offering:CourseOffering){
  return this.service.getOfferingExaminations(offering.id).pipe(
   switchMap(exams=>from(exams.filter(exam=>exam.status===6)).pipe(
    mergeMap(exam=>this.service.getExaminationResults(exam.id).pipe(
     map(results=>{
      const row=results.find(result=>result.studentId===this.id);
      return row?{...row,examId:exam.id,title:exam.title,scheduledDate:exam.scheduledDate,maximumMarks:exam.maximumMarks,offeringId:offering.id}:null;
     }),
     catchError(()=>of(null))
    ),3),
    toArray(),
    map(rows=>rows.filter((row):row is ExaminationResult&{examId:string;title:string;scheduledDate:string;maximumMarks:number;offeringId:string}=>row!==null))
   )),
   catchError(()=>of([]))
  );
 }
 private studentOfferings(){
  return this.service.getCourseOfferings().pipe(
   switchMap(offerings=>from(offerings).pipe(
    mergeMap(offering=>this.service.getEnrollments(offering.id).pipe(
     map(rows=>rows.some(row=>row.studentId===this.id&&(row.status===1||row.status===3))?offering:null),
     catchError(()=>of(null))
    ),4),
    toArray(),
    map(rows=>rows.filter((row):row is CourseOffering=>row!==null))
   ))
  );
 }
}
