import { Component,DestroyRef,inject,signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder,ReactiveFormsModule,Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { TranscriptsService } from './transcripts.service';
import { TranscriptIssued } from './transcripts.models';

@Component({selector:'app-transcript-issuance-page',standalone:true,imports:[ReactiveFormsModule,DatePipe],template:`
<section class="container-fluid px-0">
 <header class="mb-4"><div class="small text-uppercase fw-semibold text-primary mb-2">Registrar / Academic documents</div><h1 class="h3 fw-bold mb-1">Issue official transcript</h1><p class="text-secondary mb-0">Create a tamper-evident transcript snapshot for a student with finalized course grades.</p></header>
 <div class="row g-4"><div class="col-xl-5"><div class="card border-0 shadow-sm"><div class="card-header bg-white p-3"><h2 class="h6 fw-bold mb-0">Transcript issuance</h2></div><div class="card-body">
  @if(error()){<div class="alert alert-danger">{{error()}}</div>}
  <form [formGroup]="form" (ngSubmit)="issue()"><div class="mb-3"><label class="form-label" for="studentId">Student ID</label><input id="studentId" class="form-control" formControlName="studentId" placeholder="Enter student GUID" autocomplete="off"><div class="form-text">Use the student's internal ID. The backend resolves the official academic record.</div></div>
  <div class="alert alert-info small">Issuance captures a point-in-time academic record and its SHA-256 digest. The student must have at least one finalized course grade. Issued snapshots are immutable.</div>
  <button class="btn btn-primary" [disabled]="form.invalid||submitting()">@if(submitting()){<span class="spinner-border spinner-border-sm me-2"></span>}Issue official transcript</button></form>
 </div></div></div>
 <div class="col-xl-7">@if(issued();as t){<div class="card border-0 shadow-sm"><div class="card-header bg-white p-3 d-flex justify-content-between"><h2 class="h6 fw-bold mb-0">Transcript issued successfully</h2><span class="badge text-bg-success">Official</span></div><div class="card-body">
  <div class="mb-3"><div class="small text-secondary">Registration number</div><strong>{{t.registrationNumber}}</strong></div><div class="mb-3"><div class="small text-secondary">Issued at</div><strong>{{t.issuedAtUtc|date:'medium'}}</strong></div><div class="mb-3"><div class="small text-secondary">Verification code</div><code class="user-select-all">{{t.verificationCode}}</code><button class="btn btn-sm btn-outline-secondary ms-2" type="button" (click)="copy(t.verificationCode)">Copy</button></div><div class="mb-3"><div class="small text-secondary">SHA-256 snapshot digest</div><code class="small user-select-all text-break">{{t.snapshotSha256}}</code></div><a class="btn btn-primary" [href]="'/transcript-verification/'+t.verificationCode" target="_blank" rel="noopener">Open public verification</a><div class="small text-secondary mt-3">The student can now find this document in My Transcripts and download its PDF.</div>
 </div></div>}@else{<div class="card border-0 shadow-sm h-100"><div class="card-body d-flex flex-column justify-content-center align-items-center text-center py-5"><div class="display-6 text-secondary mb-3">▤</div><h2 class="h6 fw-bold">Official transcript preview</h2><p class="text-secondary small mb-0">After issuance, the verification code, immutable snapshot digest and public verification link will appear here.</p></div></div>}</div></div>
</section>`})
export class TranscriptIssuancePage {
 private readonly api=inject(TranscriptsService);private readonly fb=inject(FormBuilder);private readonly destroyRef=inject(DestroyRef);
 readonly form=this.fb.nonNullable.group({studentId:['',[Validators.required,Validators.pattern(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/)]]});
 readonly submitting=signal(false);readonly error=signal('');readonly issued=signal<TranscriptIssued|null>(null);
 issue():void{if(this.form.invalid||this.submitting())return;this.submitting.set(true);this.error.set('');this.issued.set(null);this.api.issueOfficial(this.form.getRawValue().studentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:x=>{this.issued.set(x);this.submitting.set(false);},error:e=>{this.error.set(e instanceof HttpErrorResponse?(e.error?.detail??e.error?.message??'Transcript issuance failed.'):'An unexpected error occurred.');this.submitting.set(false);}});}
 async copy(value:string):Promise<void>{try{await navigator.clipboard.writeText(value);}catch{this.error.set('Could not copy automatically. Select and copy the verification code manually.');}}
}
