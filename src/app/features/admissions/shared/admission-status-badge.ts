import { Component, Input } from '@angular/core';
import { AdmissionStatus, admissionStatusLabel } from '../admissions.models';

@Component({selector:'app-admission-status-badge',standalone:true,
 template:`<span class="badge rounded-pill" [class.text-bg-secondary]="status===1" [class.text-bg-info]="status===2||status===3" [class.text-bg-success]="status===4" [class.text-bg-danger]="status===5||status===7" [class.text-bg-warning]="status===6">{{label}}</span>`})
export class AdmissionStatusBadge {
 @Input({required:true}) status!:AdmissionStatus;
 get label():string{return admissionStatusLabel(this.status);}
}