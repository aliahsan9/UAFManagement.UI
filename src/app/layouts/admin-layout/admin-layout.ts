import { Component,computed,inject,signal } from '@angular/core';
import { NavigationEnd,Router,RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AccessControlService } from '../../core/authorization/access-control.service';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';

interface AdminNavLink {label:string;path:string;policies:string[];icon:string;}
interface AdminNavSection {label:string;links:AdminNavLink[];}
const ADMIN_NAV:AdminNavSection[]=[
 {label:'UNIVERSITY STRUCTURE',links:[
  {label:'Universities',path:'/academic-structure/universities',policies:['AcademicStructure.Admin'],icon:'▦'},
  {label:'Campuses',path:'/academic-structure/campuses',policies:['AcademicStructure.Admin'],icon:'⌖'},
  {label:'Faculties',path:'/academic-structure/faculties',policies:['AcademicStructure.Admin'],icon:'▤'},
  {label:'Departments',path:'/academic-structure/departments',policies:['AcademicStructure.Admin'],icon:'▥'},
  {label:'Academic programs',path:'/academic-structure/programs',policies:['AcademicStructure.Admin'],icon:'▧'}]},
 {label:'ACADEMIC CATALOG',links:[
  {label:'Academic sessions',path:'/academic-sessions',policies:['AcademicCatalog.Management'],icon:'▦'},
  {label:'Courses',path:'/courses',policies:['AcademicCatalog.Management'],icon:'▤'}]},
 {label:'COURSE DELIVERY',links:[{label:'Course offerings',path:'/course-offerings',policies:['CourseOfferings.Management'],icon:'▣'}]},
 {label:'STUDENTS',links:[{label:'Student directory',path:'/students',policies:['Students.Management'],icon:'♙'}]},
 {label:'ADMISSIONS',links:[{label:'Admissions portal',path:'/admissions/staff',policies:['Admissions.Staff'],icon:'▣'}]},
 {label:'EMPLOYEES',links:[{label:'Employee directory',path:'/employees',policies:['Employees.Management'],icon:'♧'}]},
 {label:'ATTENDANCE',links:[
  {label:'Attendance management',path:'/attendance',policies:['Attendance.Management','AcademicCatalog.Management','CourseOfferings.Management','Students.Management'],icon:'✓'},
 ]},
 {label:'EXAMINATIONS',links:[
  {label:'Examination management',path:'/examinations',policies:['Examinations.Management','CourseOfferings.Management'],icon:'▣'},
  {label:'Examination approvals',path:'/examinations/approvals',policies:['Examinations.Management','Examinations.Approval','CourseOfferings.Management'],icon:'✓'}]},
 {label:'GRADING & GPA',links:[
  {label:'Grade scales',path:'/grading/scales',policies:['Grading.ScaleManagement','AcademicCatalog.Management'],icon:'▤'},
  {label:'Grade finalization',path:'/grading/finalization',policies:['Grading.CourseGradeManagement','CourseOfferings.Management'],icon:'✓'},
  {label:'Grade appeals',path:'/grading/appeals',policies:['Grading.GradeAppealReview'],icon:'↗'},
  {label:'Revision requests',path:'/grading/revisions',policies:['Grading.GradeRevisionRequestManagement'],icon:'↻'},
  {label:'Revision approvals',path:'/grading/revisions/approvals',policies:['Grading.GradeRevisionRequestManagement','Grading.GradeRevisionApproval'],icon:'✓'}]},
 {label:'FINANCE',links:[{label:'Finance & fee management',path:'/finance',policies:['Finance.Management','Analytics.Read'],icon:'◈'}]},
 {label:'ACADEMIC DOCUMENTS',links:[{label:'Issue official transcript',path:'/transcripts/issue',policies:['Transcripts.Issuance'],icon:'▤'}]},
 {label:'SCHEDULING',links:[{label:'Timetable & rooms',path:'/timetable',policies:['Timetable.Management'],icon:'▦'}]}
];

@Component({selector:'app-admin-layout',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive],
template:`<div class="admin-shell" [class.sidebar-open]="sidebarOpen()"><aside class="sidebar">
<a class="brand" routerLink="/dashboard"><span class="brand__mark">U</span><span><strong>UAF</strong><small>Administration Portal</small></span></a>
<div class="sidebar-caption">WORKSPACE</div><nav class="sidebar-nav" aria-label="Administration navigation">
<a routerLink="/dashboard" routerLinkActive="nav-link--active"><span>⌂</span> Overview</a>
@for(section of navSections();track section.label){<div class="sidebar-caption sidebar-caption--spaced">{{section.label}}</div>@for(link of section.links;track link.path){<a [routerLink]="link.path" routerLinkActive="nav-link--active"><span>{{link.icon}}</span>{{link.label}}</a>}}
</nav><div class="sidebar-footer"><div class="sidebar-help-icon">?</div><div><strong>Need assistance?</strong><small>Contact your system administrator.</small></div></div><div class="sidebar-version">UAF PORTAL <span>v1.0</span></div></aside>
<div class="admin-main"><header class="topbar"><div class="topbar-left"><button class="icon-button menu-toggle" (click)="sidebarOpen.update(v=>!v)" aria-label="Toggle navigation">☰</button><div class="breadcrumbs"><span>Administration</span><b>/</b><strong>{{pageTitle()}}</strong></div></div>
<div class="topbar-actions"><div class="topbar-divider"></div><div class="user-menu"><div class="user-avatar">{{initials}}</div><div class="user-meta"><strong>{{auth.currentUser()?.fullName??'University User'}}</strong><small>{{auth.currentUser()?.roles?.[0]??'Portal account'}}</small></div><button class="icon-button user-menu-button" aria-label="Sign out" (click)="logout()">↗</button></div></div></header>
<main class="page-content"><router-outlet/></main><footer class="app-footer"><span>© {{year}} University of Agriculture, Faisalabad</span><span>UAF Management System · Administration Portal</span></footer></div></div>`})
export class AdminLayout {
 readonly auth=inject(AuthService);readonly access=inject(AccessControlService);private readonly notices=inject(NotificationService);private readonly confirm=inject(ConfirmationService);private readonly router=inject(Router);
 readonly sidebarOpen=signal(false);readonly pageTitle=signal('Overview');readonly year=new Date().getFullYear();
 readonly navSections=computed(()=>ADMIN_NAV.map(section=>({...section,links:section.links.filter(link=>this.access.hasPolicies(link.policies))})).filter(section=>section.links.length>0));
 get initials():string{return(this.auth.currentUser()?.fullName??'UAF').split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();}
 constructor(){this.router.events.pipe(filter(e=>e instanceof NavigationEnd)).subscribe(()=>{this.pageTitle.set(this.router.url.split('/').filter(Boolean).pop()?.replaceAll('-',' ')??'Overview');this.sidebarOpen.set(false);});}
 async logout():Promise<void>{const ok=await this.confirm.confirm('You will need to sign in again to access the portal.',{title:'Sign out of your account?',confirmText:'Sign out',danger:true});if(!ok)return;this.auth.logout().subscribe(()=>{this.notices.show('You have been signed out.','success');void this.router.navigateByUrl('/auth/login');});}
}
