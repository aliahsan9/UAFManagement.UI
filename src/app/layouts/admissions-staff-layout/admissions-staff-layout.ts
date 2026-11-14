import { Component,inject } from '@angular/core';
import { Router,RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AccessControlService } from '../../core/authorization/access-control.service';
@Component({selector:'app-admissions-staff-layout',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet],template:`
<div class="min-vh-100 bg-body-tertiary"><header class="navbar navbar-expand bg-white border-bottom px-3 px-lg-5"><a class="navbar-brand fw-bold text-primary" routerLink="/admissions/staff">UAF <span class="text-body fw-normal">Admissions Portal</span></a><nav class="ms-auto d-flex align-items-center gap-3"><a class="nav-link" routerLink="/admissions/staff" routerLinkActive="active">Overview</a><a class="nav-link" routerLink="/admissions/staff/applications" routerLinkActive="active">Application queue</a>@if(access.hasPolicy('Admissions.Decision')){<a class="nav-link" routerLink="/admissions/staff/registration-series" routerLinkActive="active">Registration series</a>}<span class="small text-secondary d-none d-md-inline">{{auth.currentUser()?.fullName}}</span><button class="btn btn-sm btn-outline-secondary" (click)="logout()">Sign out</button></nav></header><main class="container-fluid px-3 px-lg-5 py-4"><router-outlet/></main><footer class="border-top bg-white py-3 px-3 px-lg-5 small text-secondary">University of Agriculture, Faisalabad · Admissions Staff Portal</footer></div>`})
export class AdmissionsStaffLayout {
 readonly auth=inject(AuthService);readonly access=inject(AccessControlService);private readonly router=inject(Router);
 logout():void{this.auth.logout().subscribe(()=>void this.router.navigateByUrl('/auth/login'));}
}
