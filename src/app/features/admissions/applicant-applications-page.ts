import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AdmissionsService } from './admissions.service';
import { AdmissionApplication, AdmissionStatus, admissionStatusLabel } from './admissions.models';

@Component({selector:'app-applicant-applications-page',standalone:true,imports:[RouterLink],
 template:`<div class="page-heading"><div><span class="eyebrow">APPLICANT PORTAL</span><h1>My applications</h1><p>View your drafts, submitted applications and admission decisions.</p></div><a routerLink="/applicant/applications/new" class="btn btn--primary">New application</a></div><div class="card border-0 shadow-sm"><div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Application number</th><th>Applicant</th><th>Program ID</th><th>Application date</th><th>Status</th><th></th></tr></thead><tbody>@if(loading()){<tr><td colspan="6" class="text-center text-muted py-5">Loading applications…</td></tr>}@else if(applications().length){@for(app of applications();track app.id){<tr><td class="fw-semibold">{{app.applicationNumber}}</td><td>{{app.applicantFullName}}<small class="d-block text-muted">{{app.applicantEmail}}</small></td><td>{{app.academicProgramId}}</td><td>{{app.applicationDate}}</td><td><span class="badge text-bg-light">{{label(app.status)}}</span></td><td><a class="btn btn-sm btn-outline-primary" [routerLink]="['/applicant/applications',app.id]">Details</a></td></tr>}}@else{<tr><td colspan="6" class="text-center py-5"><strong>No applications found</strong><p class="small text-muted mt-2">Start a new application when you are ready.</p></td></tr>}</tbody></table></div></div>`})
export class ApplicantApplicationsPage {
 private service=inject(AdmissionsService);readonly loading=signal(true);readonly applications=signal<AdmissionApplication[]>([]);
 constructor(){this.service.getMyApplications().pipe(finalize(()=>this.loading.set(false))).subscribe({next:x=>this.applications.set(x),error:()=>this.applications.set([])});}
 label(status:AdmissionStatus):string{return admissionStatusLabel(status);}
}