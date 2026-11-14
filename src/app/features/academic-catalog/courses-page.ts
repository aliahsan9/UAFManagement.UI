import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AcademicCatalogService } from './academic-catalog.service';
import { AcademicStructureService } from '../academic-structure/academic-structure.service';
import { Course, CreateCourseRequest, DepartmentOption, UpdateCourseRequest } from './academic-catalog.models';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
 selector:'app-courses-page',standalone:true,imports:[ReactiveFormsModule],
 template:`
 <section class="container-fluid px-0">
  <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4"><div><div class="text-uppercase small fw-semibold text-primary mb-2">Academic catalog / Curriculum</div><h1 class="h3 fw-bold mb-1">Courses</h1><p class="text-secondary mb-0">Maintain the university course catalogue and department ownership.</p></div><button class="btn btn-primary" type="button" (click)="openCreate()" [disabled]="!departmentsLoaded() || !activeDepartments().length">Create course</button></div>
  @if(error()){<div class="alert alert-danger d-flex justify-content-between align-items-center" role="alert"><span>{{error()}}</span><button class="btn btn-sm btn-outline-danger" (click)="load()">Retry</button></div>}
  @if(departmentsError()){<div class="alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-2" role="alert"><span>{{departmentsError()}} Course department lookup requires the academic-structure.manage permission.</span><button class="btn btn-sm btn-outline-warning" type="button" (click)="loadDepartments()">Retry department lookup</button></div>}
  <div class="card border-0 shadow-sm"><div class="card-header bg-white border-0 px-4 pt-4"><div class="d-flex flex-wrap justify-content-between align-items-center gap-3"><div><h2 class="h6 fw-bold mb-1">Course catalogue</h2><p class="small text-secondary mb-0">Filter by owning department and activation state.</p></div>
   <div class="d-flex flex-wrap gap-2"><select class="form-select form-select-sm" aria-label="Filter by department" style="min-width:190px" [value]="departmentFilter()" [disabled]="!departmentsLoaded()" (change)="changeDepartment($any($event.target).value)"><option value="">All departments</option>@for(d of departments();track d.id){<option [value]="d.id">{{d.name}} ({{d.code}})</option>}</select><select class="form-select form-select-sm" aria-label="Filter by active state" style="min-width:145px" [value]="activeFilter()" (change)="changeActive($any($event.target).value)"><option value="">All states</option><option value="true">Active</option><option value="false">Inactive</option></select><button class="btn btn-sm btn-outline-secondary" type="button" (click)="load()" [disabled]="loading()">Refresh</button></div>
  </div></div><div class="card-body px-4 pb-4">
   @if(loading()){<div class="text-center py-5 text-secondary"><span class="spinner-border spinner-border-sm me-2"></span>Loading courses…</div>}
   @else{<div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th>Course code</th><th>Course title</th><th>Department</th><th>Credit hours</th><th>Status</th><th class="text-end">Actions</th></tr></thead><tbody>
    @for(course of courses();track course.id){<tr><td class="font-monospace fw-semibold">{{course.code}}</td><td>{{course.title}}</td><td>{{departmentName(course.departmentId)}}</td><td>{{course.creditHours}}</td><td><span class="badge rounded-pill" [class.text-bg-success]="course.isActive" [class.text-bg-secondary]="!course.isActive">{{course.isActive?'Active':'Inactive'}}</span></td>
     <td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-secondary me-1" type="button" (click)="viewDetails(course)">Details</button><button class="btn btn-sm btn-outline-primary me-1" type="button" (click)="openEdit(course)">Edit</button>@if(course.isActive){<button class="btn btn-sm btn-outline-danger" type="button" (click)="setActive(course,false)">Deactivate</button>}@else{<button class="btn btn-sm btn-outline-success" type="button" (click)="setActive(course,true)">Reactivate</button>}</td></tr>}
    @empty{<tr><td colspan="6" class="text-center py-5 text-secondary">No courses found for the selected filters.</td></tr>}
   </tbody></table></div>}
  </div></div>
 </section>

 @if(formOpen()){<div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" (click)="closeForm()"><div class="modal-dialog modal-dialog-centered modal-lg" role="document" (click)="$event.stopPropagation()"><div class="modal-content border-0 shadow">
  <div class="modal-header"><div><h2 class="modal-title fs-5 fw-bold">{{editingId()?'Edit course':'Create course'}}</h2><p class="small text-secondary mb-0">Course codes are unique within their department.</p></div><button class="btn-close" aria-label="Close" (click)="closeForm()"></button></div>
  <form [formGroup]="form" (ngSubmit)="save()"><div class="modal-body"><div class="row g-3">
   <div class="col-12"><label class="form-label" for="course-department">Department</label><select id="course-department" class="form-select" formControlName="departmentId" [disabled]="!!editingId()"><option value="">Select department</option>@for(d of activeDepartments();track d.id){<option [value]="d.id">{{d.name}} ({{d.code}})</option>}</select>@if(form.controls.departmentId.touched&&form.controls.departmentId.invalid){<div class="text-danger small">Select an active department.</div>}</div>
   <div class="col-md-4"><label class="form-label" for="course-code">Course code</label><input id="course-code" class="form-control text-uppercase" formControlName="code" maxlength="30" placeholder="e.g. CSC-101">@if(form.controls.code.touched&&form.controls.code.invalid){<div class="text-danger small">Course code is required (maximum 30 characters).</div>}</div>
   <div class="col-md-8"><label class="form-label" for="course-title">Course title</label><input id="course-title" class="form-control" formControlName="title" maxlength="180" placeholder="e.g. Introduction to Programming">@if(form.controls.title.touched&&form.controls.title.invalid){<div class="text-danger small">Course title is required (maximum 180 characters).</div>}</div>
   <div class="col-md-4"><label class="form-label" for="course-credit">Credit hours</label><input id="course-credit" class="form-control" type="number" min="0.01" max="10" step="0.01" formControlName="creditHours">@if(form.controls.creditHours.touched&&form.controls.creditHours.invalid){<div class="text-danger small">Credit hours must be greater than 0 and no more than 10.</div>}</div>
   <div class="col-12"><label class="form-label" for="course-description">Description <span class="text-secondary">(optional)</span></label><textarea id="course-description" class="form-control" rows="3" formControlName="description" maxlength="1000" placeholder="Brief course overview"></textarea></div>
  </div></div><div class="modal-footer"><button class="btn btn-outline-secondary" type="button" (click)="closeForm()">Cancel</button><button class="btn btn-primary" type="submit" [disabled]="saving()">{{saving()?'Saving…':(editingId()?'Save changes':'Create course')}}</button></div></form>
 </div></div></div>}

 @if(selectedCourse()){<div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" (click)="selectedCourse.set(null)"><div class="modal-dialog modal-dialog-centered" role="document" (click)="$event.stopPropagation()"><div class="modal-content border-0 shadow">
  <div class="modal-header"><div><h2 class="modal-title fs-5 fw-bold">Course details</h2><p class="small text-secondary mb-0 font-monospace">{{selectedCourse()!.code}}</p></div><button class="btn-close" aria-label="Close" (click)="selectedCourse.set(null)"></button></div>
  <div class="modal-body">@if(detailsLoading()){<div class="text-center py-4"><span class="spinner-border spinner-border-sm me-2"></span>Loading details…</div>}@else{<dl class="row mb-0"><dt class="col-sm-4 text-secondary">Title</dt><dd class="col-sm-8">{{selectedCourse()!.title}}</dd><dt class="col-sm-4 text-secondary">Department</dt><dd class="col-sm-8">{{departmentName(selectedCourse()!.departmentId)}}</dd><dt class="col-sm-4 text-secondary">Credit hours</dt><dd class="col-sm-8">{{selectedCourse()!.creditHours}}</dd><dt class="col-sm-4 text-secondary">Status</dt><dd class="col-sm-8"><span class="badge rounded-pill" [class.text-bg-success]="selectedCourse()!.isActive" [class.text-bg-secondary]="!selectedCourse()!.isActive">{{selectedCourse()!.isActive?'Active':'Inactive'}}</span></dd><dt class="col-sm-4 text-secondary">Description</dt><dd class="col-sm-8 text-break">{{selectedCourse()!.description||'—'}}</dd><dt class="col-sm-4 text-secondary">Created</dt><dd class="col-sm-8">{{formatTimestamp(selectedCourse()!.createdAtUtc)}}</dd><dt class="col-sm-4 text-secondary">Last updated</dt><dd class="col-sm-8">{{selectedCourse()!.updatedAtUtc?formatTimestamp(selectedCourse()!.updatedAtUtc!):'—'}}</dd></dl>}</div>
 </div></div></div>}
 `
})
export class CoursesPage implements OnInit {
 private readonly api=inject(AcademicCatalogService);
 private readonly structure=inject(AcademicStructureService);
 private readonly fb=inject(FormBuilder);
 private readonly destroyRef=inject(DestroyRef);
 private readonly confirmation=inject(ConfirmationService);
 private readonly notifications=inject(NotificationService);
 readonly courses=signal<Course[]>([]);
 readonly departments=signal<DepartmentOption[]>([]);
 readonly departmentsLoaded=signal(false);
 readonly departmentsError=signal('');
 readonly loading=signal(false);
 readonly saving=signal(false);
 readonly error=signal('');
 readonly formOpen=signal(false);
 readonly editingId=signal<string|null>(null);
 readonly selectedCourse=signal<Course|null>(null);
 readonly detailsLoading=signal(false);
 readonly departmentFilter=signal('');
 readonly activeFilter=signal('');
 readonly activeDepartments=computed(()=>this.departments().filter(x=>x.isActive));
 readonly form=this.fb.group({
  departmentId:['',Validators.required],
  code:['',[Validators.required,Validators.maxLength(30)]],
  title:['',[Validators.required,Validators.maxLength(180)]],
  creditHours:[3,[Validators.required,Validators.min(0.01),Validators.max(10)]],
  description:['',Validators.maxLength(1000)]
 });

 ngOnInit():void {
  this.loadDepartments();
  this.load();
 }
 loadDepartments():void {
  this.departmentsError.set('');
  this.structure.getDepartments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
   next:items=>{this.departments.set(items);this.departmentsLoaded.set(true);},
   error:err=>{this.departmentsLoaded.set(false);this.departmentsError.set(this.errorMessage(err));}
  });
 }
 load():void {
  this.loading.set(true);this.error.set('');
  const active=this.activeFilter()===''?undefined:this.activeFilter()==='true';
  this.api.getCourses({departmentId:this.departmentFilter()||undefined,isActive:active}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
   next:items=>this.courses.set(items),
   error:err=>{this.error.set(this.errorMessage(err));this.loading.set(false);},
   complete:()=>this.loading.set(false)
  });
 }
 changeDepartment(value:string):void{this.departmentFilter.set(value);this.load();}
 changeActive(value:string):void{this.activeFilter.set(value);this.load();}
 departmentName(id:string):string{return this.departments().find(x=>x.id===id)?.name??id;}
 openCreate():void{
  this.editingId.set(null);this.form.reset({departmentId:'',code:'',title:'',creditHours:3,description:''});
  this.form.controls.departmentId.enable();this.formOpen.set(true);
 }
 openEdit(course:Course):void{
  this.editingId.set(course.id);
  this.form.reset({departmentId:course.departmentId,code:course.code,title:course.title,creditHours:course.creditHours,description:course.description??''});
  this.form.controls.departmentId.disable();this.formOpen.set(true);
 }
 closeForm():void{if(!this.saving())this.formOpen.set(false);}
 save():void{
  if(this.form.invalid||this.saving()){this.form.markAllAsTouched();return;}
  const value=this.form.getRawValue();
  const creditHours=Number(value.creditHours);
  this.saving.set(true);
  if(this.editingId()){
   const request:UpdateCourseRequest={code:value.code!.trim().toUpperCase(),title:value.title!.trim(),creditHours,description:value.description?.trim()||null};
   this.api.updateCourse(this.editingId()!,request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next:()=>{this.notifications.show('Course updated successfully.','success');this.formOpen.set(false);this.load();},
    error:err=>{this.notifications.show(this.errorMessage(err),'error');this.saving.set(false);},
    complete:()=>this.saving.set(false)
   });
  }else{
   const request:CreateCourseRequest={departmentId:value.departmentId!,code:value.code!.trim().toUpperCase(),title:value.title!.trim(),creditHours,description:value.description?.trim()||null};
   this.api.createCourse(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
    next:()=>{this.notifications.show('Course created successfully.','success');this.formOpen.set(false);this.load();},
    error:err=>{this.notifications.show(this.errorMessage(err),'error');this.saving.set(false);},
    complete:()=>this.saving.set(false)
   });
  }
 }
 async setActive(course:Course,active:boolean):Promise<void>{
  const action=active?'reactivate':'deactivate';
  const accepted=await this.confirmation.confirm(`Are you sure you want to ${action} “${course.code} — ${course.title}”?`,{title:`${active?'Reactivate':'Deactivate'} course?`,confirmText:active?'Reactivate':'Deactivate',danger:!active});
  if(!accepted)return;
  const request=active?this.api.reactivateCourse(course.id):this.api.deactivateCourse(course.id);
  request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
   next:()=>{this.notifications.show(`Course ${active?'reactivated':'deactivated'} successfully.`,'success');this.load();},
   error:err=>this.notifications.show(this.errorMessage(err),'error')
  });
 }
 viewDetails(course:Course):void{
  this.selectedCourse.set(course);this.detailsLoading.set(true);
  this.api.getCourse(course.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
   next:value=>this.selectedCourse.set(value),
   error:err=>{this.detailsLoading.set(false);this.notifications.show(this.errorMessage(err),'error');},
   complete:()=>this.detailsLoading.set(false)
  });
 }
 formatTimestamp(value:string):string{return new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}
 private errorMessage(error:unknown):string{
  if(error instanceof HttpErrorResponse)return error.error?.detail??error.error?.title??error.error?.message??(error.status===0?'Unable to reach the API. Check your connection.':`Request failed (HTTP ${error.status}).`);
  return 'An unexpected error occurred.';
 }
}
