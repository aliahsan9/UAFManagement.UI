import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AcademicCatalogService } from './academic-catalog.service';
import { AcademicSessionStatus, sessionStatusLabel, sessionStatusValue } from './academic-catalog.models';
import { environment } from '../../../environments/environment';

describe('AcademicCatalogService', () => {
 let service:AcademicCatalogService;
 let http:HttpTestingController;
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});service=TestBed.inject(AcademicCatalogService);http=TestBed.inject(HttpTestingController);});
 afterEach(()=>http.verify());

 it('uses the backend session lifecycle routes and enum query values',()=>{
  service.getSessions(AcademicSessionStatus.Planned).subscribe();
  const list=http.expectOne(r=>r.url===environment.apiBaseUrl+'/api/v1/academic-sessions/'&&r.params.get('status')==='1');
  expect(list.request.method).toBe('GET');list.flush([]);
  service.activateSession('session-id').subscribe();
  const activate=http.expectOne(environment.apiBaseUrl+'/api/v1/academic-sessions/session-id/activate');
  expect(activate.request.method).toBe('POST');expect(activate.request.body).toBeNull();activate.flush(null);
  service.completeSession('session-id').subscribe();
  const complete=http.expectOne(environment.apiBaseUrl+'/api/v1/academic-sessions/session-id/complete');
  expect(complete.request.method).toBe('POST');complete.flush(null);
  service.cancelSession('session-id').subscribe();
  const cancel=http.expectOne(environment.apiBaseUrl+'/api/v1/academic-sessions/session-id/cancel');
  expect(cancel.request.method).toBe('POST');cancel.flush(null);
 });

 it('does not send parent identifiers when updating a session',()=>{
  service.updateSession('s1',{name:'Spring 2027',code:'SP27',startDate:'2027-01-01',endDate:'2027-06-01'}).subscribe();
  const request=http.expectOne(environment.apiBaseUrl+'/api/v1/academic-sessions/s1');
  expect(request.request.method).toBe('PUT');expect(request.request.body).toEqual({name:'Spring 2027',code:'SP27',startDate:'2027-01-01',endDate:'2027-06-01'});request.flush(null);
 });

 it('applies course filters and sends the correct create/update/deactivate/reactivate contracts',()=>{
  service.getCourses({departmentId:'dept-1',isActive:false}).subscribe();
  const list=http.expectOne(r=>r.url===environment.apiBaseUrl+'/api/v1/courses/'&&r.params.get('departmentId')==='dept-1'&&r.params.get('isActive')==='false');
  list.flush([]);
  service.createCourse({departmentId:'dept-1',code:'CSC-101',title:'Programming',creditHours:3,description:null}).subscribe();
  const create=http.expectOne(environment.apiBaseUrl+'/api/v1/courses/');
  expect(create.request.method).toBe('POST');expect(create.request.body.departmentId).toBe('dept-1');create.flush({id:'c1'});
  service.updateCourse('c1',{code:'CSC-102',title:'Programming II',creditHours:3,description:null}).subscribe();
  const update=http.expectOne(environment.apiBaseUrl+'/api/v1/courses/c1');
  expect(update.request.method).toBe('PUT');expect(update.request.body).not.toHaveProperty('departmentId');update.flush(null);
  service.deactivateCourse('c1').subscribe();const deactivate=http.expectOne(environment.apiBaseUrl+'/api/v1/courses/c1');expect(deactivate.request.method).toBe('DELETE');deactivate.flush(null);
  service.reactivateCourse('c1').subscribe();const reactivate=http.expectOne(environment.apiBaseUrl+'/api/v1/courses/c1/reactivate');expect(reactivate.request.method).toBe('POST');reactivate.flush(null);
 });

 it('maps the backend numeric session status enum to readable UI labels',()=>{
  expect([1,2,3,4].map(value=>sessionStatusValue(value))).toEqual([AcademicSessionStatus.Planned,AcademicSessionStatus.Active,AcademicSessionStatus.Completed,AcademicSessionStatus.Cancelled]);
  expect([1,2,3,4].map(value=>sessionStatusLabel(value))).toEqual(['Planned','Active','Completed','Cancelled']);
  expect(sessionStatusLabel('Active')).toBe('Active');
 });
});
