import { Component,inject } from '@angular/core';
import { Router,RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AccessControlService } from '../../core/authorization/access-control.service';
@Component({selector:'app-student-portal-layout',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet],template:`
<div class="min-vh-100 bg-body-tertiary"><header class="navbar navbar-expand bg-white border-bottom px-3 px-lg-5"><a class="navbar-brand fw-bold text-primary" routerLink="/student/dashboard">UAF <span class="text-body fw-normal">Student Portal</span></a><nav class="ms-auto d-flex align-items-center gap-3"><a class="nav-link" routerLink="/student/dashboard" routerLinkActive="active">Overview</a>@if(access.hasPolicy('AcademicRecords.Student')){<a class="nav-link" routerLink="/student/academic-record" routerLinkActive="active">Academic record</a><a class="nav-link" routerLink="/student/transcripts" routerLinkActive="active">My transcripts</a>}<span class="small text-secondary d-none d-md-inline">{{auth.currentUser()?.fullName}}</span><button class="btn btn-sm btn-outline-secondary" (click)="logout()">Sign out</button></nav></header><main class="container-fluid px-3 px-lg-5 py-4"><router-outlet/></main><footer class="border-top bg-white py-3 px-3 px-lg-5 small text-secondary">University of Agriculture, Faisalabad · Student Portal</footer></div>`})
export class StudentPortalLayout {
 readonly auth=inject(AuthService);readonly access=inject(AccessControlService);private readonly router=inject(Router);
 logout():void{this.auth.logout().subscribe(()=>void this.router.navigateByUrl('/auth/login'));}
}
