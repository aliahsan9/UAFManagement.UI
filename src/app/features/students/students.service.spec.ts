import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { StudentStatus } from './students.models';
import { StudentsService } from './students.service';

describe('StudentsService',()=>{
 let service:StudentsService;let http:HttpTestingController;
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});service=TestBed.inject(StudentsService);http=TestBed.inject(HttpTestingController);});
 afterEach(()=>http.verify());
 const base=environment.apiBaseUrl;

 it('requests a paged directory with supported filters and sorting',()=>{
  service.getStudents({page:2,pageSize:25,academicProgramId:'program-1',status:StudentStatus.Suspended,search:'Ali',sortBy:'fullName',sortDirection:'desc'}).subscribe();
  const req=http.expectOne(r=>r.url===base+'/api/v1/students/'&&r.params.get('page')==='2'&&r.params.get('pageSize')==='25'&&r.params.get('academicProgramId')==='program-1'&&r.params.get('status')==='2'&&r.params.get('search')==='Ali'&&r.params.get('sortBy')==='fullName'&&r.params.get('sortDirection')==='desc');
  expect(req.request.method).toBe('GET');req.flush({items:[],page:2,pageSize:25,totalCount:0,totalPages:0});
 });

 it('creates students and reads an individual profile',()=>{
  service.createStudent({registrationNumber:'UAF-001',fullName:'Student One',email:'student@example.com',academicProgramId:'program-1',enrollmentDate:'2026-09-01',phoneNumber:null}).subscribe();
  const create=http.expectOne(base+'/api/v1/students/');expect(create.request.method).toBe('POST');expect(create.request.body.academicProgramId).toBe('program-1');create.flush({id:'student-1'});
  service.getStudent('student-1').subscribe();const detail=http.expectOne(base+'/api/v1/students/student-1');expect(detail.request.method).toBe('GET');detail.flush({id:'student-1'});
 });

 it('updates personal profile and changes academic program through separate endpoints',()=>{
  service.updateProfile('s1',{fullName:'Updated Name',email:'new@example.com',phoneNumber:'03000000000'}).subscribe();
  const profile=http.expectOne(base+'/api/v1/students/s1/profile');expect(profile.request.method).toBe('PUT');expect(profile.request.body).toEqual({fullName:'Updated Name',email:'new@example.com',phoneNumber:'03000000000'});profile.flush(null);
  service.changeProgram('s1',{academicProgramId:'program-2'}).subscribe();
  const program=http.expectOne(base+'/api/v1/students/s1/academic-program');expect(program.request.method).toBe('PUT');expect(program.request.body).toEqual({academicProgramId:'program-2'});program.flush(null);
 });

 it('uses the four student lifecycle endpoints without inventing request bodies',()=>{
  for(const action of ['suspend','reactivate','graduate','withdraw'] as const){service[action]('s1').subscribe();const req=http.expectOne(base+'/api/v1/students/s1/'+action);expect(req.request.method).toBe('POST');expect(req.request.body).toBeNull();req.flush(null);}
 });

 it('loads fee account, course offerings, enrollments and attendance through their own APIs',()=>{
  service.getFeeAccount('s1').subscribe();const fee=http.expectOne(base+'/api/v1/finance/students/s1/account');expect(fee.request.method).toBe('GET');fee.flush({studentId:'s1',totalOutstanding:0,challans:[],payments:[]});
  service.getCourseOfferings().subscribe();const offerings=http.expectOne(base+'/api/v1/course-offerings/');expect(offerings.request.method).toBe('GET');offerings.flush([]);
  service.getEnrollments('offering-1').subscribe();const enrollments=http.expectOne(base+'/api/v1/course-offerings/offering-1/enrollments');expect(enrollments.request.method).toBe('GET');enrollments.flush([]);
  service.getAttendanceReport('offering-1').subscribe();const attendance=http.expectOne(base+'/api/v1/attendance/offerings/offering-1/report');expect(attendance.request.method).toBe('GET');attendance.flush({students:[]});
 });

 it('loads published examination results using offering and examination endpoints',()=>{
  service.getOfferingExaminations('offering-1').subscribe();const exams=http.expectOne(base+'/api/v1/examinations/offerings/offering-1');expect(exams.request.method).toBe('GET');exams.flush([]);
  service.getExaminationResults('exam-1').subscribe();const results=http.expectOne(base+'/api/v1/examinations/exam-1/results');expect(results.request.method).toBe('GET');results.flush([]);
 });
});
