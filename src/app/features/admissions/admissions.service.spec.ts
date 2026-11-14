import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AdmissionsService } from './admissions.service';
import { AdmissionStatus } from './admissions.models';
import { environment } from '../../../environments/environment';

describe('AdmissionsService',()=>{
 let service:AdmissionsService;let http:HttpTestingController;
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});service=TestBed.inject(AdmissionsService);http=TestBed.inject(HttpTestingController);});
 afterEach(()=>http.verify());

 it('loads only applicant-visible active programs and applicant-owned applications',()=>{
  service.getApplicantPrograms().subscribe();
  const programs=http.expectOne(environment.apiBaseUrl+'/api/v1/applicant/admissions/programs');
  expect(programs.request.method).toBe('GET');programs.flush([]);
  service.getMyApplications().subscribe();
  const applications=http.expectOne(environment.apiBaseUrl+'/api/v1/applicant/admissions/');
  expect(applications.request.method).toBe('GET');applications.flush([]);
 });

 it('uses the staff queue paging and filter query contract',()=>{
  service.getStaffApplications({status:AdmissionStatus.UnderReview,academicProgramId:'program-1',search:'Ali',page:2,pageSize:25}).subscribe();
  const request=http.expectOne(r=>r.url===environment.apiBaseUrl+'/api/v1/admissions/'&&r.params.get('status')==='3'&&r.params.get('academicProgramId')==='program-1'&&r.params.get('search')==='Ali'&&r.params.get('page')==='2'&&r.params.get('pageSize')==='25');
  expect(request.request.method).toBe('GET');request.flush({items:[],page:2,pageSize:25,totalCount:0,totalPages:0});
 });

 it('records decisions with remarks and fetches staff application details',()=>{
  service.getStaffApplication('app-1').subscribe();
  const detail=http.expectOne(environment.apiBaseUrl+'/api/v1/admissions/app-1');expect(detail.request.method).toBe('GET');detail.flush({id:'app-1'});
  service.recordDecision('app-1','reject','Missing academic transcript').subscribe();
  const decision=http.expectOne(environment.apiBaseUrl+'/api/v1/admissions/app-1/reject');
  expect(decision.request.method).toBe('POST');expect(decision.request.body).toEqual({remarks:'Missing academic transcript'});decision.flush(null);
 });

 it('configures registration series and converts accepted applications',()=>{
  service.configureRegistrationSeries({academicProgramId:'program-1',admissionYear:2027,prefix:'UAF-CS-27',nextNumber:1}).subscribe();
  const config=http.expectOne(environment.apiBaseUrl+'/api/v1/admissions/registration-series');
  expect(config.request.method).toBe('POST');expect(config.request.body.admissionYear).toBe(2027);config.flush(null);
  service.convertToStudent('app-1').subscribe();
  const convert=http.expectOne(environment.apiBaseUrl+'/api/v1/admissions/app-1/convert-to-student');
  expect(convert.request.method).toBe('POST');expect(convert.request.body).toBeNull();convert.flush({studentId:'student-1'});
 });
});
