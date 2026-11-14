import { Component,DestroyRef,OnInit,inject,signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { TranscriptsService } from './transcripts.service';
import { TranscriptVerification } from './transcripts.models';

@Component({selector:'app-transcript-verification-page',standalone:true,imports:[DatePipe],template:`
<main class="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary p-3"><section class="card border-0 shadow-sm w-100" style="max-width:680px">
 <div class="card-body p-4 p-md-5"><div class="text-center mb-4"><div class="fw-bold text-primary text-uppercase">University of Agriculture, Faisalabad</div><h1 class="h3 fw-bold mt-3">Transcript verification</h1><p class="text-secondary mb-0">Public verification of official academic transcript authenticity</p></div>
 @if(loading()){<div class="text-center py-5"><span class="spinner-border text-primary"></span><p class="text-secondary mt-3 mb-0">Checking verification record…</p></div>}
 @else if(result();as r){@if(r.isAuthentic){<div class="alert alert-success text-center"><div class="h5 fw-bold mb-1">Authentic transcript</div><div class="small">The issued transcript snapshot passed its integrity check.</div></div><dl class="row mt-4 mb-0"><dt class="col-sm-5 text-secondary fw-normal">Registration number</dt><dd class="col-sm-7 fw-semibold">{{r.registrationNumber}}</dd><dt class="col-sm-5 text-secondary fw-normal">Date issued</dt><dd class="col-sm-7">{{r.issuedAtUtc|date:'medium'}}</dd><dt class="col-sm-5 text-secondary fw-normal">Snapshot SHA-256</dt><dd class="col-sm-7"><code class="small text-break">{{r.snapshotSha256}}</code></dd></dl>}@else{<div class="alert alert-danger text-center"><div class="h5 fw-bold mb-1">Not verified</div><div class="small">No authentic issued transcript was found for this verification code, or its integrity check failed.</div></div>}}
 @else{<div class="alert alert-warning">{{error()}}</div>}
 <div class="border-top mt-4 pt-3 text-center small text-secondary">This public page does not require a student login. It only displays the verification result returned by the University's transcript service.</div>
 </div></section></main>`})
export class TranscriptVerificationPage implements OnInit {
 private readonly api=inject(TranscriptsService);private readonly route=inject(ActivatedRoute);private readonly destroyRef=inject(DestroyRef);
 readonly loading=signal(true);readonly error=signal('');readonly result=signal<TranscriptVerification|null>(null);
 ngOnInit():void{const code=this.route.snapshot.paramMap.get('verificationCode')??'';if(!/^[0-9a-fA-F]{32}$/.test(code)){this.result.set({isAuthentic:false,registrationNumber:null,issuedAtUtc:null,snapshotSha256:null});this.loading.set(false);return;}this.api.verify(code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:x=>{this.result.set(x);this.loading.set(false);},error:e=>{this.error.set(e instanceof HttpErrorResponse?(e.error?.detail??e.error?.message??'Verification service is temporarily unavailable.'):'Unable to verify transcript.');this.loading.set(false);}});}
}
