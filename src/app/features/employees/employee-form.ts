import { Component,EventEmitter,Input,Output,inject,OnChanges,SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,FormBuilder,ReactiveFormsModule,Validators } from '@angular/forms';
import { Department } from '../academic-structure/academic-structure.models';
import { AcademicStructureService } from '../academic-structure/academic-structure.service';
import { CreateEmployeeRequest,Employee,EMPLOYEE_CATEGORIES,EmployeeCategory,UpdateEmployeeProfileRequest } from './employees.models';
@Component({selector:'app-employee-form',standalone:true,imports:[CommonModule,FormsModule,ReactiveFormsModule],template:`
<form [formGroup]="form" (ngSubmit)="submit()" class="row g-3">
@if(!employee){<div class="col-md-6"><label class="form-label">Employee number</label><input class="form-control" formControlName="employeeNumber"></div>}
<div class="col-md-6"><label class="form-label">Full name</label><input class="form-control" formControlName="fullName"></div>
<div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" formControlName="email"></div>
<div class="col-md-6"><label class="form-label">Designation</label><input class="form-control" formControlName="designation"></div>
<div class="col-md-6"><label class="form-label">Phone number</label><input class="form-control" formControlName="phoneNumber"></div>
@if(!employee){<div class="col-md-6"><label class="form-label">Department</label><select class="form-select" formControlName="departmentId"><option value="">Select department</option>@for(d of departments;track d.id){<option [value]="d.id">{{d.name}}</option>}</select></div>
<div class="col-md-6"><label class="form-label">Category</label><select class="form-select" formControlName="category">@for(c of categories;track c.value){<option [ngValue]="c.value">{{c.label}}</option>}</select></div>
<div class="col-md-6"><label class="form-label">Joining date</label><input type="date" class="form-control" formControlName="joiningDate"></div>
<div class="col-md-6"><label class="form-label">Identity user ID <span class="text-muted">(optional)</span></label><input class="form-control" formControlName="identityUserId"></div>}
<div class="col-12 d-flex justify-content-end gap-2"><button type="button" class="btn btn-light" (click)="cancel.emit()">Cancel</button><button class="btn btn-primary" [disabled]="form.invalid||saving">{{saving?'Saving…':employee?'Save changes':'Create employee'}}</button></div>
</form>`})
export class EmployeeForm implements OnChanges {
 @Input() employee:Employee|null=null; @Input() saving=false; @Output() save=new EventEmitter<CreateEmployeeRequest|UpdateEmployeeProfileRequest>(); @Output() cancel=new EventEmitter<void>();
 private fb=inject(FormBuilder); private structure=inject(AcademicStructureService); departments:Department[]=[]; categories=EMPLOYEE_CATEGORIES;
 form=this.fb.group({employeeNumber:['',[Validators.required,Validators.maxLength(40)]],fullName:['',[Validators.required,Validators.maxLength(160)]],email:['',[Validators.required,Validators.email]],designation:['',[Validators.required,Validators.maxLength(120)]],phoneNumber:[''],departmentId:['',Validators.required],category:[EmployeeCategory.Academic,Validators.required],joiningDate:[new Date().toISOString().slice(0,10),Validators.required],identityUserId:['']});
 constructor(){this.structure.getDepartments().subscribe({next:x=>this.departments=x});}
 ngOnChanges(_:SimpleChanges){if(this.employee){this.form.controls.employeeNumber.clearValidators();this.form.controls.employeeNumber.updateValueAndValidity();this.form.patchValue({fullName:this.employee.fullName,email:this.employee.email,designation:this.employee.designation,phoneNumber:this.employee.phoneNumber??''});}else{this.form.controls.employeeNumber.setValidators([Validators.required,Validators.maxLength(40)]);this.form.controls.employeeNumber.updateValueAndValidity();}}
 submit(){if(this.form.invalid)return;const v=this.form.getRawValue();if(this.employee)this.save.emit({fullName:v.fullName!,email:v.email!,designation:v.designation!,phoneNumber:v.phoneNumber||null});else this.save.emit({employeeNumber:v.employeeNumber!,fullName:v.fullName!,email:v.email!,designation:v.designation!,phoneNumber:v.phoneNumber||null,departmentId:v.departmentId!,category:v.category as EmployeeCategory,joiningDate:v.joiningDate!,identityUserId:v.identityUserId||null});}
}