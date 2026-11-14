import { HttpClient,HttpParams } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEmployeeRequest,Employee,EmployeePage,EmployeeQuery,TeacherProfile,TeacherProfileRequest,UpdateEmployeeProfileRequest } from './employees.models';
@Injectable({providedIn:'root'})
export class EmployeesService {
 private readonly http=inject(HttpClient); private readonly base=environment.apiBaseUrl+'/api/v1/employees';
 getPage(q:EmployeeQuery):Observable<EmployeePage>{let p=new HttpParams().set('page',q.page).set('pageSize',q.pageSize);if(q.departmentId)p=p.set('departmentId',q.departmentId);if(q.status!==undefined)p=p.set('status',q.status);if(q.category!==undefined)p=p.set('category',q.category);return this.http.get<EmployeePage>(this.base+'/',{params:p});}
 get(id:string):Observable<Employee>{return this.http.get<Employee>(this.base+'/'+id);}
 create(r:CreateEmployeeRequest):Observable<{id:string}>{return this.http.post<{id:string}>(this.base+'/',r);}
 updateProfile(id:string,r:UpdateEmployeeProfileRequest):Observable<void>{return this.http.put<void>(this.base+'/'+id+'/profile',r);}
 transfer(id:string,departmentId:string):Observable<void>{return this.http.put<void>(this.base+'/'+id+'/department',{departmentId});}
 changeStatus(id:string,status:number,effectiveDate:string|null):Observable<void>{return this.http.put<void>(this.base+'/'+id+'/status',{status,effectiveDate});}
 createTeacherProfile(id:string,r:TeacherProfileRequest):Observable<TeacherProfile>{return this.http.post<TeacherProfile>(this.base+'/'+id+'/teacher-profile',r);}
 updateTeacherProfile(id:string,r:TeacherProfileRequest):Observable<TeacherProfile>{return this.http.put<TeacherProfile>(this.base+'/'+id+'/teacher-profile',r);}
}
