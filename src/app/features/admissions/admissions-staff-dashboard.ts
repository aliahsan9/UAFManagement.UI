import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AdmissionsService } from './admissions.service';
import { AdmissionStatus, StaffApplicationPage } from './admissions.models';

@Component({selector:'app-admissions-staff-dashboard',standalone:true,imports:[CommonModule,RouterLink],
 template:`<div class="page-heading"><div><span class="eyebrow">ADMISSIONS OFFICE</span><h1>Admissions dashboard</h1><p>Monitor incoming applications and progress review decisions.</p></div><a routerLink="/admissions/staff/applications/new" class="btn btn--primary">Create draft</a></div>@if(loading()){<p class="text-muted small">Loading admission queue…</p>}@else{<div class="row g-3 mb-4">@for(card of cards;track card.label){<div class="col-md-3"><div class="card border-0 shadow-sm p-3"><span class="text-muted small">{{card.label}}</span><strong class="display-6">{{count(card.status)}}</strong></div></div>}</div>}<div class="card border-0 shadow-sm"><div class="card-header bg-white d-flex justify-content-between py-3"><strong>Application review queue</strong><a routerLink="/admissions/staff/applications" class="small">Open queue →</a></div><div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Application</th><th>Applicant</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>@for(app of page()?.items??[];track app.id){<tr><td class="fw-semibold">{{app.applicationNumber}}</td><td>{{app.applicantFullName}}</td><td><span class="badge text-bg-light">{{app.status}}</span></td><td>{{app.createdAtUtc|date:'mediumDate'}}</td><td><a [routerLink]="['/admissions/staff/applications',app.id]" class="btn btn-sm btn-outline-primary">Review</a></td></tr>}@empty{<tr><td colspan="5" class="text-center text-muted py-4">No applications in the current queue.</td></tr>}</tbody></table></div></div>`})
export class AdmissionsStaffDashboard {
 private service=inject(AdmissionsService);readonly loading=signal(true);readonly page=signal<StaffApplicationPage|null>(null);readonly counts=signal<Record<number,number>>({});
 readonly cards=[{label:'Submitted',status:AdmissionStatus.Submitted},{label:'Under review',status:AdmissionStatus.UnderReview},{label:'Accepted',status:AdmissionStatus.Accepted},{label:'Waitlisted',status:AdmissionStatus.Waitlisted}];
 constructor(){this.service.getStaffApplications({page:1,pageSize:100}).pipe(finalize(()=>this.loading.set(false))).subscribe({next:p=>{this.page.set(p);const c:Record<number,number>={};for(const x of p.items)c[x.status]=(c[x.status]??0)+1;this.counts.set(c);},error:()=>this.page.set(null)});}
 count(s:AdmissionStatus):number{return this.counts()[s]??0;}
}