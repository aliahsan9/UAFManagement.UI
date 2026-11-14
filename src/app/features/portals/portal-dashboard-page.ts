import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccessControlService } from '../../core/authorization/access-control.service';

interface PortalLink { title:string;description:string;path:string;policy?:string;policies?:string[];icon:string; }
const PORTALS:Record<string,{eyebrow:string;title:string;description:string;links:PortalLink[];emptyMessage?:string}> = {
 administration:{eyebrow:'UNIVERSITY WORKSPACE',title:'Administration Portal',description:'Manage university operations through the modules assigned to your account.',links:[
  {title:'University structure',description:'Universities, campuses, faculties, departments and programs.',path:'/academic-structure/universities',policy:'AcademicStructure.Admin',icon:'US'},
  {title:'Student management',description:'Student directory, academic status and profiles.',path:'/students',policy:'Students.Management',icon:'ST'},
  {title:'Academic catalog',description:'Academic sessions and course catalog.',path:'/academic-sessions',policy:'AcademicCatalog.Management',icon:'AC'},
  {title:'Course offerings',description:'Course delivery and student enrollment.',path:'/course-offerings',policy:'CourseOfferings.Management',icon:'CO'},
  {title:'Admissions operations',description:'Review applications and admissions workflow.',path:'/admissions/staff',policy:'Admissions.Staff',icon:'AD'},
  {title:'Employees',description:'University employee records and administration.',path:'/employees',policy:'Employees.Management',icon:'EM'},
  {title:'Finance and fees',description:'Fee heads, fee structures, challans and payments.',path:'/finance',policies:['Finance.Management','Analytics.Read'],icon:'FI'},
  {title:'Attendance',description:'Attendance sessions, records and reports.',path:'/attendance',policies:['Attendance.Management','AcademicCatalog.Management','CourseOfferings.Management','Students.Management'],icon:'AT'},
  {title:'Examinations',description:'Examination schedules, marks and results.',path:'/examinations',policies:['Examinations.Management','CourseOfferings.Management'],icon:'EX'},
  {title:'Examination approvals',description:'Approve submitted marks and publish approved examination results.',path:'/examinations/approvals',policies:['Examinations.Management','Examinations.Approval','CourseOfferings.Management'],icon:'EA'},
  {title:'Grade scales',description:'Configure published grading scales.',path:'/grading/scales',policies:['Grading.ScaleManagement','AcademicCatalog.Management'],icon:'GS'},
  {title:'Grade appeals',description:'Review student grade appeals.',path:'/grading/appeals',policy:'Grading.GradeAppealReview',icon:'GA'},
  {title:'Grade revision requests',description:'Manage pending student grade revision requests.',path:'/grading/revisions',policy:'Grading.GradeRevisionRequestManagement',icon:'GR'},
  {title:'Grade revision approvals',description:'Approve or reject revision requests under the separate approval policy.',path:'/grading/revisions/approvals',policies:['Grading.GradeRevisionRequestManagement','Grading.GradeRevisionApproval'],icon:'GA'},
  {title:'Official transcripts',description:'Issue official academic transcripts.',path:'/transcripts/issue',policy:'Transcripts.Issuance',icon:'TR'},
  {title:'Timetable',description:'Manage teaching rooms and timetable entries.',path:'/timetable',policy:'Timetable.Management',icon:'TT'},
 ]},
 admissions:{eyebrow:'ADMISSIONS OPERATIONS',title:'Admissions Portal',description:'Process applicant submissions, verify supporting documents and make admission decisions within your assigned authority.',links:[
  {title:'Application queue',description:'Review submitted applications and their current status.',path:'/admissions/staff/applications',policy:'Admissions.Staff',icon:'AQ'},
  {title:'Create staff application',description:'Start an application on behalf of an applicant.',path:'/admissions/staff/applications/new',policy:'Admissions.Staff',icon:'NA'},
  {title:'Registration series',description:'Manage admission decision registration sequences.',path:'/admissions/staff/registration-series',policies:['Admissions.Staff','Admissions.Decision'],icon:'RS'}
 ]},
 student:{eyebrow:'STUDENT WORKSPACE',title:'Student Portal',description:'Your academic journey, course results and official academic documents in one place.',links:[
  {title:'Academic record',description:'Semester grades, GPA, appeals and revision history.',path:'/student/academic-record',policy:'AcademicRecords.Student',icon:'AR'},
  {title:'My transcripts',description:'Preview, verify and download official transcripts.',path:'/student/transcripts',policy:'AcademicRecords.Student',icon:'TR'},
  {title:'Admissions applications',description:'View your applicant self-service workspace.',path:'/applicant/dashboard',policy:'Admissions.Applicant',icon:'AD'}
 ]},
 faculty:{eyebrow:'FACULTY WORKSPACE',title:'Faculty / Examination Portal',description:'Access teaching and examination workflows permitted for your faculty account.',links:[
  {title:'Attendance management',description:'Record attendance and review course attendance.',path:'/faculty/attendance',policies:['Attendance.Management','AcademicCatalog.Management','CourseOfferings.Management','Students.Management'],icon:'AT'},
  {title:'Examinations and marks',description:'Manage examinations and enter marks for assigned work.',path:'/faculty/examinations',policies:['Examinations.Management','CourseOfferings.Management'],icon:'EX'}
 ],emptyMessage:'The backend grants Teacher attendance and examination management policies, but the shared screens also require course-offering, academic-catalog and student-management lookup policies. Those lookup permissions are not assigned to Teacher, so links are withheld rather than exposing screens that would fail with authorization errors. The backend needs teacher-scoped read endpoints or explicitly approved read policies to enable these workflows.'}
};

@Component({selector:'app-portal-dashboard-page',standalone:true,imports:[RouterLink],template:`
<section class="container-fluid px-0">
 <header class="mb-4"><div class="small text-uppercase fw-semibold text-primary mb-2">{{portal().eyebrow}}</div><h1 class="h3 fw-bold mb-2">{{portal().title}}</h1><p class="text-secondary mb-0">{{portal().description}}</p></header>
 <div class="row g-3">
  @for(link of links();track link.path){<div class="col-12 col-md-6 col-xl-4"><a class="card h-100 border-0 shadow-sm text-decoration-none portal-module-card" [routerLink]="link.path"><div class="card-body p-4"><div class="d-flex align-items-center justify-content-between mb-3"><span class="rounded-3 bg-primary-subtle text-primary fw-bold px-3 py-2">{{link.icon}}</span><span class="text-primary">Open →</span></div><h2 class="h6 fw-bold text-body">{{link.title}}</h2><p class="small text-secondary mb-0">{{link.description}}</p></div></a></div>}
  @empty {<div class="col-12"><div class="alert alert-info">{{portal().emptyMessage??'No modules are assigned to this account yet. Contact your system administrator if you believe this is incorrect.'}}</div></div>}
 </div>
 <div class="small text-secondary mt-4">Available modules are calculated using a frontend mirror of the backend role-to-permission mapping. API authorization is enforced independently by the backend.</div>
</section>`})
export class PortalDashboardPage {
 private readonly route=inject(ActivatedRoute);private readonly access=inject(AccessControlService);
 readonly portal=computed(()=>PORTALS[String(this.route.snapshot.data['portal']??'administration')]??PORTALS['administration']);
 readonly links=computed(()=>this.portal().links.filter(link=>link.policies?this.access.hasPolicies(link.policies):this.access.hasPolicy(link.policy??'')));
}
