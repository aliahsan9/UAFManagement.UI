import { Component,inject } from '@angular/core';
import { Router,RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AccessControlService } from '../../core/authorization/access-control.service';
@Component({selector:'app-faculty-portal-layout',standalone:true,imports:[RouterLink,RouterLinkActive,RouterOutlet],template:`
<div class="min-vh-100 bg-body-tertiary"><header class="navbar navbar-expand bg-white border-bottom px-3 px-lg-5"><a class="navbar-brand fw-bold text-primary" routerLink="/faculty/dashboard">UAF <span class="text-body fw-normal">Faculty / Examination Portal</span></a><nav class="ms-auto d-flex align-items-center gap-3"><a class="nav-link" routerLink="/faculty/dashboard" routerLinkActive="active">Overview</a>@if(access.hasPolicy('Attendance.Management')){<a class="nav-link" routerLink="/faculty/attendance" routerLinkActive="active">Attendance</a>}@if(access.hasPolicy('Examinations.Management')){<a class="nav-link" routerLink="/faculty/examinations" routerLinkActive="active">Examinations</a>}<span class="small text-secondary d-none d-md-inline">{{auth.currentUser()?.fullName}}</span><button class="btn btn-sm btn-outline-secondary" (click)="logout()">Sign out</button></nav></header><main class="container-fluid px-3 px-lg-5 py-4"><router-outlet/></main><footer class="border-top bg-white py-3 px-3 px-lg-5 small text-secondary">University of Agriculture, Faisalabad · Faculty Portal</footer></div>`})
export class FacultyPortalLayout {
 readonly auth=inject(AuthService);readonly access=inject(AccessControlService);private readonly router=inject(Router);
 logout():void{this.auth.logout().subscribe(()=>void this.router.navigateByUrl('/auth/login'));}
}
