import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AcademicStructureService } from '../academic-structure/academic-structure.service';
import { AcademicProgram } from '../academic-structure/academic-structure.models';
import { StudentStatusBadge } from './student-status-badge';
import { StudentsService } from './students.service';
import { Student, StudentPage, StudentQuery, StudentStatus, STUDENT_STATUSES } from './students.models';

@Component({selector:'app-students-directory-page',standalone:true,imports:[FormsModule,RouterLink,StudentStatusBadge],
 template:`
 <section class="container-fluid py-3 student-module">
  <header class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><div class="text-uppercase small fw-semibold text-primary mb-1">STUDENT MANAGEMENT</div><h1 class="h3 mb-1">Student directory</h1><p class="text-muted mb-0">Search, review and manage registered student records.</p></div><a class="btn btn-primary" routerLink="/students/new">Create student</a></header>
  @if(error()){<div class="alert alert-danger" role="alert">{{error()}} <button class="btn btn-sm btn-outline-danger ms-2" (click)="load()">Retry</button></div>}
  <div class="card border-0 shadow-sm mb-3"><div class="card-body"><form class="row g-3 align-items-end" (ngSubmit)="applyFilters()">
   <div class="col-12 col-lg-4"><label class="form-label" for="student-search">Search students</label><input id="student-search" class="form-control" name="search" [(ngModel)]="search" placeholder="Registration number, name or email"></div>
   <div class="col-12 col-md-6 col-lg-3"><label class="form-label" for="student-program">Academic program</label><select id="student-program" class="form-select" name="program" [(ngModel)]="academicProgramId"><option value="">All programs</option>@for(p of programs();track p.id){<option [value]="p.id">{{p.name}} ({{p.code}})</option>}</select></div>
   <div class="col-12 col-md-6 col-lg-2"><label class="form-label" for="student-status">Academic status</label><select id="student-status" class="form-select" name="status" [(ngModel)]="status"><option value="">All statuses</option>@for(s of statuses;track s.value){<option [value]="s.value">{{s.label}}</option>}</select></div>
   <div class="col-12 col-lg-3 d-flex gap-2"><button class="btn btn-primary flex-fill" type="submit" [disabled]="loading()">Apply filters</button><button class="btn btn-outline-secondary" type="button" (click)="reset()">Reset</button></div>
  </form>
  @if(programError()){<div class="small text-warning mt-3">{{programError()}} Program filtering is unavailable until you have academic-structure access.</div>}</div></div>
  <div class="card border-0 shadow-sm"><div class="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3"><strong>Student records</strong><span class="small text-muted">{{page()?.totalCount??0}} records</span></div>
   <div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th>Registration no.</th><th>Student</th><th>Academic program</th><th>Enrollment date</th><th>Status</th><th class="text-end">Action</th></tr></thead><tbody>
   @if(loading()){<tr><td colspan="6" class="text-center py-5"><span class="spinner-border spinner-border-sm me-2"></span>Loading student records…</td></tr>}
   @else if(page()?.items?.length){@for(student of page()!.items;track student.id){<tr><td class="fw-semibold">{{student.registrationNumber}}</td><td><div class="fw-semibold">{{student.fullName}}</div><div class="small text-muted">{{student.email}}</div></td><td><span class="text-break">{{programName(student.academicProgramId)}}</span></td><td>{{student.enrollmentDate|date:'mediumDate'}}</td><td><app-student-status-badge [status]="student.status"/></td><td class="text-end"><a class="btn btn-sm btn-outline-primary" [routerLink]="['/students',student.id]">View profile</a></td></tr>}}
   @else{<tr><td colspan="6" class="text-center text-muted py-5">No students match the selected filters.</td></tr>}
   </tbody></table></div>
   <div class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2"><div class="small text-muted">Page {{page()?.page??1}} of {{page()?.totalPages??0}} · {{page()?.totalCount??0}} students</div><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-secondary" (click)="goToPage((page()?.page??1)-1)" [disabled]="loading()||(page()?.page??1)<=1">Previous</button><button class="btn btn-sm btn-outline-secondary" (click)="goToPage((page()?.page??1)+1)" [disabled]="loading()||(page()?.page??1)>=(page()?.totalPages??0)">Next</button></div></div>
  </div>
 </section>`})
export class StudentsDirectoryPage implements OnInit {
 private readonly service=inject(StudentsService);private readonly structure=inject(AcademicStructureService);
 readonly page=signal<StudentPage|null>(null);readonly programs=signal<AcademicProgram[]>([]);readonly loading=signal(false);readonly error=signal<string|null>(null);readonly programError=signal<string|null>(null);
 readonly statuses=STUDENT_STATUSES;search='';academicProgramId='';status:number|string='';private currentPage=1;private readonly pageSize=20;
 ngOnInit():void{this.structure.getPrograms().subscribe({next:p=>this.programs.set(p),error:()=>this.programError.set('Academic program names could not be loaded for this account.')});this.load();}
 load():void{this.loading.set(true);this.error.set(null);const query:StudentQuery={page:this.currentPage,pageSize:this.pageSize,sortBy:'registrationNumber',sortDirection:'asc'};if(this.academicProgramId)query.academicProgramId=this.academicProgramId;if(this.status!=='')query.status=Number(this.status) as StudentStatus;if(this.search.trim())query.search=this.search.trim();this.service.getStudents(query).subscribe({next:p=>{this.page.set(p);this.loading.set(false);},error:e=>{this.error.set(e.error?.detail??'Student records could not be loaded. Check your student-management permission and API connection.');this.loading.set(false);}});}
 applyFilters():void{this.currentPage=1;this.load();}
 reset():void{this.search='';this.academicProgramId='';this.status='';this.currentPage=1;this.load();}
 goToPage(page:number):void{if(page<1||page>(this.page()?.totalPages??0))return;this.currentPage=page;this.load();}
 programName(id:string):string{return this.programs().find(x=>x.id===id)?.name??id;}
}
