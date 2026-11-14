import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({selector:'app-applicant-layout',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],
 template:`<div class="applicant-shell"><header class="applicant-header"><a routerLink="/applicant/dashboard" class="applicant-brand"><span class="applicant-brand__mark">U</span><span><strong>UAF Admissions</strong><small>Applicant Portal</small></span></a><nav><a routerLink="/applicant/dashboard" routerLinkActive="active">Overview</a><a routerLink="/applicant/applications" routerLinkActive="active">My applications</a></nav><div class="applicant-account"><span>{{auth.currentUser()?.fullName??'Applicant'}}</span><button class="btn btn--quiet btn-sm" (click)="logout()">Sign out</button></div></header><main class="applicant-content"><router-outlet/></main><footer class="applicant-footer">University of Agriculture, Faisalabad · Admissions Portal</footer></div>`})
export class ApplicantLayout {
 readonly auth=inject(AuthService);private router=inject(Router);private notices=inject(NotificationService);
 logout():void{this.auth.logout().subscribe(()=>{this.notices.show('You have been signed out.','success');void this.router.navigateByUrl('/applicant/login');});}
}