import { Component, Input } from '@angular/core';
import { SubmissionReadiness } from '../admissions.models';

@Component({selector:'app-submission-progress',standalone:true,
 template:`@if(readiness){<div class="d-flex justify-content-between small mb-2"><strong>Submission readiness</strong><span class="text-muted">{{verified}} / {{total}} verified</span></div><div class="progress mb-2" style="height:7px"><div class="progress-bar" [style.width.%]="percentage"></div></div><p class="small text-muted mb-0">@if(!readiness.requirementsConfigured){Requirements have not been configured for this program.}@else if(readiness.canSubmit){All required documents are verified.}@else{Upload the missing documents and wait for verification.}</p>}`})
export class SubmissionProgress {
 @Input() readiness:SubmissionReadiness|null=null;
 get total():number{return this.readiness?.requiredDocumentTypes.length??0;}
 get verified():number{return this.total-(this.readiness?.missingVerifiedDocumentTypes.length??0);}
 get percentage():number{return this.total?this.verified/this.total*100:0;}
}