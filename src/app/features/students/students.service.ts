import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChangeStudentProgramRequest, CourseAttendanceReport, CourseEnrollment, CourseOffering, CreateStudentRequest, ExaminationListItem, ExaminationResult, Student, StudentFeeAccount, StudentPage, StudentQuery, UpdateStudentProfileRequest } from './students.models';

@Injectable({providedIn:'root'})
export class StudentsService {
 private readonly http=inject(HttpClient);
 private readonly studentsUrl=environment.apiBaseUrl+'/api/v1/students';
 private readonly offeringsUrl=environment.apiBaseUrl+'/api/v1/course-offerings';
 private readonly attendanceUrl=environment.apiBaseUrl+'/api/v1/attendance';
 private readonly examinationsUrl=environment.apiBaseUrl+'/api/v1/examinations';
 private readonly financeUrl=environment.apiBaseUrl+'/api/v1/finance';

 getStudents(query:StudentQuery):Observable<StudentPage>{
  let params=new HttpParams().set('page',query.page).set('pageSize',query.pageSize).set('sortBy',query.sortBy??'registrationNumber').set('sortDirection',query.sortDirection??'asc');
  if(query.academicProgramId)params=params.set('academicProgramId',query.academicProgramId);
  if(query.status!==undefined)params=params.set('status',query.status);
  if(query.search?.trim())params=params.set('search',query.search.trim());
  return this.http.get<StudentPage>(this.studentsUrl+'/',{params});
 }
 getStudent(id:string):Observable<Student>{return this.http.get<Student>(this.studentsUrl+'/'+id);}
 createStudent(request:CreateStudentRequest):Observable<{id:string}>{return this.http.post<{id:string}>(this.studentsUrl+'/',request);}
 updateProfile(id:string,request:UpdateStudentProfileRequest):Observable<void>{return this.http.put<void>(this.studentsUrl+'/'+id+'/profile',request);}
 changeProgram(id:string,request:ChangeStudentProgramRequest):Observable<void>{return this.http.put<void>(this.studentsUrl+'/'+id+'/academic-program',request);}
 suspend(id:string):Observable<void>{return this.http.post<void>(this.studentsUrl+'/'+id+'/suspend',null);}
 reactivate(id:string):Observable<void>{return this.http.post<void>(this.studentsUrl+'/'+id+'/reactivate',null);}
 graduate(id:string):Observable<void>{return this.http.post<void>(this.studentsUrl+'/'+id+'/graduate',null);}
 withdraw(id:string):Observable<void>{return this.http.post<void>(this.studentsUrl+'/'+id+'/withdraw',null);}

 getFeeAccount(studentId:string):Observable<StudentFeeAccount>{return this.http.get<StudentFeeAccount>(this.financeUrl+'/students/'+studentId+'/account');}
 getCourseOfferings():Observable<CourseOffering[]>{return this.http.get<CourseOffering[]>(this.offeringsUrl+'/');}
 getEnrollments(offeringId:string):Observable<CourseEnrollment[]>{return this.http.get<CourseEnrollment[]>(this.offeringsUrl+'/'+offeringId+'/enrollments');}
 getAttendanceReport(offeringId:string):Observable<CourseAttendanceReport>{return this.http.get<CourseAttendanceReport>(this.attendanceUrl+'/offerings/'+offeringId+'/report');}
 getOfferingExaminations(offeringId:string):Observable<ExaminationListItem[]>{return this.http.get<ExaminationListItem[]>(this.examinationsUrl+'/offerings/'+offeringId);}
 getExaminationResults(examinationId:string):Observable<ExaminationResult[]>{return this.http.get<ExaminationResult[]>(this.examinationsUrl+'/'+examinationId+'/results');}
}
