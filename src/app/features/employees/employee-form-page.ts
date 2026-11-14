import { Component,inject,signal } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EmployeeForm } from './employee-form';
import { EmployeesService } from './employees.service';
import { CreateEmployeeRequest,Employee,UpdateEmployeeProfileRequest } from './employees.models';
import { NotificationService } from '../../core/services/notification.service';
@Component({selector:'app-employee-form-page',standalone:true,imports:[EmployeeForm],template:`<div class="mb-4"><div class="text-muted small">EMPLOYEE MANAGEMENT</div><h2>{{employee?'Edit employee':'Add employee'}}</h2><p class="text-muted mb-0">{{employee?'Update personal and contact details.':'Create a new university employee record.'}}</p></div>@if(loading()){<div class="text-muted p-4">Loading employee…</div>}@else{<div class="card border-0 shadow-sm"><div class="card-body p-4"><app-employee-form [employee]="employee" [saving]="saving()" (save)="submit($event)" (cancel)="back()"/></div></div>}`})
export class EmployeeFormPage {
 private route=inject(ActivatedRoute);private router=inject(Router);private api=inject(EmployeesService);private notices=inject(NotificationService);
 id=this.route.snapshot.paramMap.get('id');employee:Employee|null=null;loading=signal(false);saving=signal(false);
 constructor(){if(this.id){this.loading.set(true);this.api.get(this.id).subscribe({next:e=>{this.employee=e;this.loading.set(false);},error:()=>{this.loading.set(false);this.notices.show('Unable to load employee.','error');void this.router.navigateByUrl('/employees');}});}}
 submit(r:CreateEmployeeRequest|UpdateEmployeeProfileRequest){this.saving.set(true);const req:Observable<unknown>=this.id?this.api.updateProfile(this.id,r as UpdateEmployeeProfileRequest):this.api.create(r as CreateEmployeeRequest);req.subscribe({next:result=>{this.saving.set(false);this.notices.show(this.id?'Employee profile updated.':'Employee created successfully.','success');void this.router.navigate(['/employees',this.id??(result as {id:string}).id]);},error:e=>{this.saving.set(false);this.notices.show(e.error?.detail??'Unable to save employee.','error');}});}
 back(){void this.router.navigateByUrl(this.id?'/employees/'+this.id:'/employees');}
}