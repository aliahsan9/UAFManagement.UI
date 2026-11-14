import { Component,DestroyRef,OnInit,inject,signal } from '@angular/core';
import { DatePipe,DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { TranscriptsService } from './transcripts.service';
import { TranscriptListItem } from './transcripts.models';
import { StudentAcademicRecord } from '../grading/grading.models';

@Component({selector:'app-my-transcripts-page',standalone:true,imports:[DatePipe,DecimalPipe],template:`
<section class="container-fluid px-0">
 <header class="mb-4"><div class="small text-uppercase fw-semibold text-primary mb-2">Student portal / Academic documents</div><h1 class="h3 fw-bold mb-1">My transcripts</h1><p class="text-secondary mb-0">View your official transcript records, preview your academic standing and download issued PDF documents.</p></header>
 @if(error()){<div class="alert alert-danger" role="alert">{{error()}}</div>}
 @if(loading()){<div class="card border-0 shadow-sm"><div class="card-body text-center py-5"><span class="spinner-border spinner-border-sm me-2"></span>Loading transcript records…</div></div>}
 @else {
  @if(record();as r){<div class="card border-0 shadow-sm mb-4"><div class="card-header bg-white p-3"><h2 class="h6 fw-bold mb-0">Academic transcript preview</h2><small class="text-secondary">Live academic record · official transcript requires registrar issuance</small></div><div class="card-body">
   <div class="text-center border-bottom pb-3 mb-3"><div class="fw-bold text-uppercase">University of Agriculture, Faisalabad</div><h3 class="h5 fw-bold mt-2 mb-1">Academic Transcript Preview</h3><div class="small text-secondary">Unofficial preview — not valid as an issued document</div></div>
   <div class="row g-3 mb-3"><div class="col-md-6"><div class="small text-secondary">Student name</div><strong>{{r.fullName}}</strong></div><div class="col-md-3"><div class="small text-secondary">Registration number</div><strong>{{r.registrationNumber}}</strong></div><div class="col-md-3"><div class="small text-secondary">Cumulative GPA</div><strong>{{r.cumulativeGpa===null?'—':(r.cumulativeGpa|number:'1.0-2')}}</strong></div></div>
   @for(s of r.semesters;track s.academicSessionId){<h4 class="h6 fw-bold mt-3">{{s.academicSessionName}} <span class="float-end">GPA: {{s.gpa===null?'—':(s.gpa|number:'1.0-2')}}</span></h4><div class="table-responsive"><table class="table table-sm table-bordered align-middle"><thead class="table-light"><tr><th>Course code</th><th>Course title</th><th>Credits</th><th>Marks</th><th>Percentage</th><th>Grade</th><th>Points</th></tr></thead><tbody>@for(c of s.courses;track c.gradeId){<tr><td>{{c.courseCode}}</td><td>{{c.courseTitle}}</td><td>{{c.creditHours}}</td><td>{{c.marksObtained}} / {{c.totalMarks}}</td><td>{{c.percentage|number:'1.0-2'}}%</td><td>{{c.letterGrade}}</td><td>{{c.gradePoints|number:'1.0-2'}}</td></tr>}</tbody></table></div>}
   <div class="text-end border-top pt-3"><strong>Cumulative GPA: {{r.cumulativeGpa===null?'—':(r.cumulativeGpa|number:'1.0-2')}}</strong><div class="small text-secondary">{{r.cumulativeGpaCreditHours}} GPA credit hours</div></div>
  </div></div>}
  <div class="card border-0 shadow-sm"><div class="card-header bg-white p-3 d-flex justify-content-between align-items-center"><div><h2 class="h6 fw-bold mb-0">Official transcript documents</h2><small class="text-secondary">Only transcripts issued by the Registrar are downloadable here.</small></div><button class="btn btn-sm btn-outline-secondary" (click)="load()" [disabled]="loading()">Refresh</button></div>
   <div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th>Issued</th><th>Registration number</th><th>Verification code</th><th>Integrity hash</th><th></th></tr></thead><tbody>@for(t of transcripts();track t.id){<tr><td>{{t.issuedAtUtc|date:'medium'}}</td><td>{{record()?.registrationNumber??'—'}}</td><td><code>{{t.verificationCode}}</code></td><td><code class="small">{{t.snapshotSha256}}</code></td><td><button class="btn btn-sm btn-primary" (click)="download(t)" [disabled]="downloadingId()===t.id">@if(downloadingId()===t.id){<span class="spinner-border spinner-border-sm me-1"></span>}Download PDF</button><a class="btn btn-sm btn-outline-secondary ms-2" [href]="'/transcript-verification/'+t.verificationCode" target="_blank" rel="noopener">Verify</a></td></tr>}@empty{<tr><td colspan="5" class="text-center text-secondary py-5">No official transcripts have been issued yet. Contact the Registrar's Office if you need an official copy.</td></tr>}</tbody></table></div>
  </div>
 }
</section>`})
export class MyTranscriptsPage implements OnInit {
 private readonly api=inject(TranscriptsService);private readonly destroyRef=inject(DestroyRef);
 readonly loading=signal(true);readonly error=signal('');readonly record=signal<StudentAcademicRecord|null>(null);readonly transcripts=signal<TranscriptListItem[]>([]);readonly downloadingId=signal('');
 ngOnInit():void{this.load();}
 load():void{this.loading.set(true);this.error.set('');this.api.getMyAcademicRecord().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:x=>this.record.set(x),error:e=>this.error.set(this.message(e))});this.api.getMine().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:x=>{this.transcripts.set(x);this.loading.set(false);},error:e=>{this.error.set(this.message(e));this.loading.set(false);}});}
 download(t:TranscriptListItem):void{this.downloadingId.set(t.id);this.api.downloadMyPdf(t.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='academic-transcript-'+t.id.replaceAll('-','')+'.pdf';a.click();URL.revokeObjectURL(url);this.downloadingId.set('');},error:e=>{this.error.set(this.message(e));this.downloadingId.set('');}});}
 private message(e:unknown):string{return e instanceof HttpErrorResponse?(e.error?.detail??e.error?.message??'Unable to load transcript information. Please try again.'): 'An unexpected error occurred while processing the transcript request.';}
}
