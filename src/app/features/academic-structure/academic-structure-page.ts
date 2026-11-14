import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataTable } from '../../shared/components/data-table/data-table';
import { AcademicStructureService } from './academic-structure.service';
import { AcademicRecord, Faculty, TableColumn, University, DEGREE_LEVELS, AcademicEntityKind, DegreeLevel } from './academic-structure.models';

type EntityConfig = { key: AcademicEntityKind; title: string; description: string; columns: TableColumn[] };
const CONFIGS: Record<AcademicEntityKind, EntityConfig> = {
 universities: { key:'universities', title:'University management', description:'Manage the institution identity and official short name.', columns:[{key:'name',label:'University'},{key:'shortName',label:'Short name'}] },
 campuses: { key:'campuses', title:'Campus management', description:'Manage university campuses and their location details.', columns:[{key:'name',label:'Campus'},{key:'code',label:'Code'},{key:'address',label:'Address'}] },
 faculties: { key:'faculties', title:'Faculty management', description:'Manage faculties under a university.', columns:[{key:'name',label:'Faculty'},{key:'code',label:'Code'}] },
 departments: { key:'departments', title:'Department management', description:'Manage departments within their parent faculty.', columns:[{key:'name',label:'Department'},{key:'code',label:'Code'}] },
 programs: { key:'programs', title:'Academic programs', description:'Manage degree programs within their parent department.', columns:[{key:'name',label:'Program'},{key:'code',label:'Code'},{key:'degreeLevel',label:'Degree level'},{key:'durationInYears',label:'Duration (years)'}] }
};

@Component({
 selector:'app-academic-structure-page', standalone:true, imports:[ReactiveFormsModule, DataTable],
 template:`
 <div class="container-fluid px-0">
  <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
   <div><div class="text-uppercase small fw-semibold text-primary mb-2">University administration / Academic structure</div><h1 class="h3 fw-bold mb-1">{{ config.title }}</h1><p class="text-secondary mb-0">{{ config.description }}</p></div>
   <button class="btn btn-primary" type="button" (click)="openCreate()">+ Add {{ singular }}</button>
  </div>
  @if(loadError()){<div class="alert alert-danger d-flex justify-content-between align-items-center"><span>{{ loadError() }}</span><button class="btn btn-sm btn-outline-danger" (click)="load()">Retry</button></div>}
  @if(loading()){<div class="card border-0 shadow-sm"><div class="card-body py-5 text-center text-secondary"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Loading {{ config.title.toLowerCase() }}...</div></div>}
  @else {<div class="card border-0 shadow-sm"><div class="card-header bg-white border-0 pt-4 px-4"><div class="d-flex justify-content-between align-items-center"><div><h2 class="h6 fw-bold mb-1">All {{ config.title.split(' ')[0] }} records</h2><p class="small text-secondary mb-0">Live data from the academic structure API</p></div><span class="badge text-bg-light border text-secondary">{{ records().length }} total</span></div></div><div class="card-body px-4 pb-4"><app-data-table [columns]="config.columns" [rows]="records()" [showStatus]="config.key!=='universities'" [allowDeactivate]="config.key!=='universities'" (edit)="openEdit($event)" (deactivate)="deactivate($event)"/></div></div>}
  @if(formOpen()){<div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" (click)="closeForm()"><div class="modal-dialog modal-dialog-centered modal-lg" role="document" (click)="$event.stopPropagation()"><div class="modal-content border-0 shadow"><div class="modal-header"><div><h2 class="modal-title fs-5 fw-bold">{{ editingId() ? 'Edit' : 'Add' }} {{ singular }}</h2><p class="small text-secondary mb-0">Enter the official information below.</p></div><button type="button" class="btn-close" aria-label="Close" (click)="closeForm()"></button></div>
   <form [formGroup]="form" (ngSubmit)="save()"><div class="modal-body"><div class="row g-3">
    @if(config.key === 'campuses' || config.key === 'faculties'){<div class="col-12"><label class="form-label">University <span class="text-danger">*</span></label><select class="form-select" formControlName="universityId" [attr.disabled]="editingId() ? true : null"><option value="">Select university</option>@for(u of universities();track u.id){<option [value]="u.id">{{u.name}} ({{u.shortName}})</option>}</select></div>}
    @if(config.key === 'departments'){<div class="col-12"><label class="form-label">University <span class="text-danger">*</span></label><select class="form-select" [value]="selectedUniversityId()" (change)="selectUniversity($any($event.target).value)"><option value="">Select university</option>@for(u of universities();track u.id){<option [value]="u.id">{{u.name}}</option>}</select></div><div class="col-12"><label class="form-label">Faculty <span class="text-danger">*</span></label><select class="form-select" formControlName="facultyId"><option value="">Select faculty</option>@for(f of filteredFaculties();track f.id){<option [value]="f.id">{{f.name}} ({{f.code}})</option>}</select></div>}
    @if(config.key === 'programs'){<div class="col-12"><label class="form-label">University <span class="text-danger">*</span></label><select class="form-select" [value]="selectedUniversityId()" (change)="selectUniversity($any($event.target).value)"><option value="">Select university</option>@for(u of universities();track u.id){<option [value]="u.id">{{u.name}}</option>}</select></div><div class="col-md-6"><label class="form-label">Faculty <span class="text-danger">*</span></label><select class="form-select" [value]="selectedFacultyId()" (change)="selectFaculty($any($event.target).value)"><option value="">Select faculty</option>@for(f of filteredFaculties();track f.id){<option [value]="f.id">{{f.name}}</option>}</select></div><div class="col-md-6"><label class="form-label">Department <span class="text-danger">*</span></label><select class="form-select" formControlName="departmentId"><option value="">Select department</option>@for(d of filteredDepartments();track d.id){<option [value]="d.id">{{d.name}} ({{d.code}})</option>}</select></div>}
    <div class="col-md-8"><label class="form-label">{{ config.key === 'universities' ? 'University name' : config.key === 'campuses' ? 'Campus name' : config.key === 'faculties' ? 'Faculty name' : config.key === 'departments' ? 'Department name' : 'Program name' }} <span class="text-danger">*</span></label><input class="form-control" formControlName="name" maxlength="160" placeholder="Enter name"><div class="form-text">Use the official name used in university records.</div></div>
    <div class="col-md-4"><label class="form-label">{{ config.key === 'universities' ? 'Short name' : 'Code' }} <span class="text-danger">*</span></label><input class="form-control text-uppercase" formControlName="code" maxlength="30" placeholder="e.g. UAF"></div>
    @if(config.key === 'campuses'){<div class="col-12"><label class="form-label">Address</label><textarea class="form-control" rows="2" formControlName="address" maxlength="500" placeholder="Campus address (optional)"></textarea></div>}
    @if(config.key === 'programs'){<div class="col-md-6"><label class="form-label">Degree level <span class="text-danger">*</span></label><select class="form-select" formControlName="degreeLevel">@for(level of degreeLevels;track level.value){<option [value]="level.value">{{level.label}}</option>}</select></div><div class="col-md-6"><label class="form-label">Duration (years) <span class="text-danger">*</span></label><input class="form-control" type="number" min="1" max="10" formControlName="durationInYears"></div>}
   </div><div class="alert alert-info small mt-3 mb-0">Parent relationships follow the API: campuses and faculties belong to a university; departments belong to a faculty; programs belong to a department. Campus is not a parent of faculty.</div></div>
   <div class="modal-footer"><button class="btn btn-light" type="button" (click)="closeForm()">Cancel</button><button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()"><span [class.spinner-border]="saving()" [class.spinner-border-sm]="saving()" class="me-1"></span>{{ saving() ? 'Saving...' : 'Save changes' }}</button></div></form>
  </div></div></div>}
 </div>`
})
export class AcademicStructurePage implements OnInit {
 private readonly api=inject(AcademicStructureService); private readonly fb=inject(FormBuilder); private readonly route=inject(ActivatedRoute);
 private readonly confirm=inject(ConfirmationService); private readonly notices=inject(NotificationService); private readonly destroyRef=inject(DestroyRef);
 readonly config:EntityConfig=CONFIGS[this.route.snapshot.data['entity'] as AcademicEntityKind] ?? CONFIGS.universities;
 readonly singular=({universities:'university',campuses:'campus',faculties:'faculty',departments:'department',programs:'academic program'} as Record<AcademicEntityKind,string>)[this.config.key];
 readonly records=signal<AcademicRecord[]>([]); readonly universities=signal<University[]>([]); readonly faculties=signal<Faculty[]>([]); readonly departments=signal<Department[]>([]);
 readonly loading=signal(false); readonly loadError=signal(''); readonly formOpen=signal(false); readonly editingId=signal<string|null>(null); readonly saving=signal(false);
 readonly selectedUniversityId=signal(''); readonly selectedFacultyId=signal(''); readonly degreeLevels=DEGREE_LEVELS;
 readonly filteredFaculties=signal<Faculty[]>([]); readonly filteredDepartments=signal<Department[]>([]);
 readonly form=this.fb.group({ universityId:[''], facultyId:[''], departmentId:[''], name:['',[Validators.required,Validators.maxLength(160)]], code:['',[Validators.required,Validators.maxLength(30)]], address:[''], degreeLevel:[1], durationInYears:[4,[Validators.required,Validators.min(1),Validators.max(10)]] });
 ngOnInit():void {
    if(this.config.key==='campuses'||this.config.key==='faculties') this.form.controls.universityId.setValidators([Validators.required]);
    if(this.config.key==='departments') this.form.controls.facultyId.setValidators([Validators.required]);
    if(this.config.key==='programs') this.form.controls.departmentId.setValidators([Validators.required]);
    this.form.updateValueAndValidity(); this.load();
  }
 load():void {
  this.loading.set(true);this.loadError.set('');
  const request=this.config.key==='universities'?this.api.getUniversities():this.config.key==='campuses'?this.api.getCampuses():this.config.key==='faculties'?this.api.getFaculties():this.config.key==='departments'?this.api.getDepartments():this.api.getPrograms();
  request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:rows=>{this.records.set(rows as AcademicRecord[]);this.loading.set(false);},error:()=>{this.loadError.set('Unable to load records. Check your access to the AcademicStructureAdmin policy and try again.');this.loading.set(false);}});
  if(this.config.key!=='universities') this.api.getUniversities().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:x=>this.universities.set(x),error:()=>this.notices.show('University options could not be loaded.','error')});
  if(this.config.key==='departments'||this.config.key==='programs') this.api.getFaculties().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:x=>this.faculties.set(x),error:()=>this.notices.show('Faculty options could not be loaded.','error')});
  if(this.config.key==='programs') this.api.getDepartments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:x=>this.departments.set(x),error:()=>this.notices.show('Department options could not be loaded.','error')});
 }
 openCreate():void { this.editingId.set(null);this.form.reset({universityId:'',facultyId:'',departmentId:'',name:'',code:'',address:'',degreeLevel:1,durationInYears:4});this.selectedUniversityId.set('');this.selectedFacultyId.set('');this.filteredFaculties.set([]);this.filteredDepartments.set([]);this.formOpen.set(true); }
 openEdit(row:Record<string,unknown>):void {
  this.editingId.set(String(row['id']));
  const facultyId=String(row['facultyId']??'');
  const departmentId=String(row['departmentId']??'');
  const faculty=this.faculties().find(x=>x.id===facultyId);
  const department=this.departments().find(x=>x.id===departmentId);
  const resolvedFacultyId=facultyId||department?.facultyId||'';
  const universityId=String(row['universityId']??faculty?.universityId??this.faculties().find(x=>x.id===resolvedFacultyId)?.universityId??'');
  this.form.reset({universityId,facultyId:resolvedFacultyId,departmentId,name:String(row['name']??''),code:String(row['shortName']??row['code']??''),address:String(row['address']??''),degreeLevel:Number(row['degreeLevel']??1),durationInYears:Number(row['durationInYears']??4)});
  this.selectedUniversityId.set(universityId);
  this.filteredFaculties.set(this.faculties().filter(x=>x.universityId===universityId));
  this.selectedFacultyId.set(resolvedFacultyId);
  this.filteredDepartments.set(this.departments().filter(x=>x.facultyId===resolvedFacultyId));
  this.formOpen.set(true);
 }
 selectUniversity(id:string):void {this.selectedUniversityId.set(id);this.selectedFacultyId.set('');this.form.patchValue({facultyId:'',departmentId:''});this.filteredFaculties.set(this.faculties().filter(x=>x.universityId===id));this.filteredDepartments.set([]);}
 selectFaculty(id:string):void {this.selectedFacultyId.set(id);this.form.patchValue({departmentId:''});this.filteredDepartments.set(this.departments().filter(x=>x.facultyId===id));}
 closeForm():void {if(!this.saving())this.formOpen.set(false);}
 save():void {
  if(this.form.invalid){this.form.markAllAsTouched();return;}this.saving.set(true);
  const v=this.form.getRawValue();const name=v.name!.trim();const code=v.code!.trim().toUpperCase();
  let request: Observable<unknown>;
  if(this.config.key==='universities') request=this.editingId()?this.api.updateUniversity(this.editingId()!,{name,shortName:code}):this.api.createUniversity({name,shortName:code});
  else if(this.config.key==='campuses') request=this.editingId()?this.api.updateCampus(this.editingId()!,{name,code,address:v.address?.trim()||null}):this.api.createCampus({universityId:v.universityId!,name,code,address:v.address?.trim()||null});
  else if(this.config.key==='faculties') request=this.editingId()?this.api.updateFaculty(this.editingId()!,{name,code}):this.api.createFaculty({universityId:v.universityId!,name,code});
  else if(this.config.key==='departments') request=this.editingId()?this.api.updateDepartment(this.editingId()!,{name,code}):this.api.createDepartment({facultyId:v.facultyId!,name,code});
  else request=this.editingId()?this.api.updateProgram(this.editingId()!,{name,code,degreeLevel:Number(v.degreeLevel) as import('./academic-structure.models').DegreeLevel,durationInYears:Number(v.durationInYears)}):this.api.createProgram({departmentId:v.departmentId!,name,code,degreeLevel:Number(v.degreeLevel) as DegreeLevel,durationInYears:Number(v.durationInYears)});
  request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.saving.set(false);this.formOpen.set(false);this.notices.show(this.singular+' saved successfully.','success');this.load();},error:()=>this.saving.set(false)});
 }
 async deactivate(row:Record<string,unknown>):Promise<void>{
  const label=String(row['name']??this.singular);const ok=await this.confirm.confirm('This will mark "'+label+'" as inactive. The record will remain in the system.',{title:'Deactivate '+this.singular+'?',confirmText:'Deactivate',danger:true});if(!ok)return;
  const id=String(row['id']);const request=this.config.key==='campuses'?this.api.deactivateCampus(id):this.config.key==='faculties'?this.api.deactivateFaculty(id):this.config.key==='departments'?this.api.deactivateDepartment(id):this.api.deactivateProgram(id);
  request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.notices.show(this.singular+' deactivated.','success');this.load();},error:()=>{}});
 }
 
}
