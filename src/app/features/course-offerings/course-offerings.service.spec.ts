import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../environments/environment';
import { CourseOfferingStatus, EnrollmentStatus, offeringStatusLabel, offeringStatusValue, enrollmentStatusLabel } from './course-offerings.models';
import { CourseOfferingsService } from './course-offerings.service';

describe('CourseOfferingsService',()=>{
 let service:CourseOfferingsService;let http:HttpTestingController;
 const base=environment.apiBaseUrl;
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});service=TestBed.inject(CourseOfferingsService);http=TestBed.inject(HttpTestingController);});
 afterEach(()=>http.verify());

 it('lists offerings with only supported server-side filters',()=>{
  service.getOfferings({academicSessionId:'session-1',courseId:'course-1',status:CourseOfferingStatus.Published}).subscribe();
  const req=http.expectOne(r=>r.url===base+'/api/v1/course-offerings/'&&r.params.get('academicSessionId')==='session-1'&&r.params.get('courseId')==='course-1'&&r.params.get('status')==='2');
  expect(req.request.method).toBe('GET');req.flush([]);
 });

 it('creates and reads offering records using the backend DTO shape',()=>{
  const request={courseId:'course-1',academicSessionId:'session-1',section:'A',capacity:40,instructorEmployeeId:null};
  service.createOffering(request).subscribe();const create=http.expectOne(base+'/api/v1/course-offerings/');expect(create.request.method).toBe('POST');expect(create.request.body).toEqual(request);create.flush({id:'offering-1'});
  service.getOffering('offering-1').subscribe();const detail=http.expectOne(base+'/api/v1/course-offerings/offering-1');expect(detail.request.method).toBe('GET');detail.flush({id:'offering-1',...request,status:1,enrolledCount:0});
 });

 it('updates only fields accepted by UpdateCourseOfferingRequest',()=>{
  service.updateOffering('offering-1',{capacity:45,instructorEmployeeId:'employee-1'}).subscribe();
  const req=http.expectOne(base+'/api/v1/course-offerings/offering-1');expect(req.request.method).toBe('PUT');expect(req.request.body).toEqual({capacity:45,instructorEmployeeId:'employee-1'});req.flush(null);
 });

 it('calls the three dedicated offering lifecycle endpoints',()=>{
  for(const action of ['publish','close','cancel'] as const){service[action]('offering-1').subscribe();const req=http.expectOne(base+'/api/v1/course-offerings/offering-1/'+action);expect(req.request.method).toBe('POST');expect(req.request.body).toBeNull();req.flush(null);}
 });

 it('lists offering enrollments and enrolls a student with an ISO date',()=>{
  service.getEnrollments('offering-1').subscribe();const list=http.expectOne(base+'/api/v1/course-offerings/offering-1/enrollments');expect(list.request.method).toBe('GET');list.flush([]);
  service.enrollStudent('offering-1','student-1',{enrolledOn:'2026-11-14'}).subscribe();const create=http.expectOne(base+'/api/v1/course-offerings/offering-1/enrollments/student-1');expect(create.request.method).toBe('POST');expect(create.request.body).toEqual({enrolledOn:'2026-11-14'});create.flush({id:'enrollment-1'});
 });

 it('uses the course-enrollments resource for drop, withdraw and complete',()=>{
  for(const action of ['dropEnrollment','withdrawEnrollment','completeEnrollment'] as const){service[action]('enrollment-1').subscribe();const suffix=action==='dropEnrollment'?'drop':action==='withdrawEnrollment'?'withdraw':'complete';const req=http.expectOne(base+'/api/v1/course-enrollments/enrollment-1/'+suffix);expect(req.request.method).toBe('POST');req.flush(null);}
 });

 it('queries timetable by courseOfferingId and resolves room details separately',()=>{
  service.getTimetableEntries('offering-1').subscribe();const entries=http.expectOne(r=>r.url===base+'/api/v1/timetable/entries'&&r.params.get('courseOfferingId')==='offering-1');expect(entries.request.method).toBe('GET');entries.flush([]);
  service.getRoom('room-1').subscribe();const room=http.expectOne(base+'/api/v1/timetable/rooms/room-1');expect(room.request.method).toBe('GET');room.flush({id:'room-1'});
 });

 it('maps the exact backend enum values to human-readable labels',()=>{
  expect(offeringStatusValue('Published')).toBe(CourseOfferingStatus.Published);
  expect(offeringStatusLabel(4)).toBe('Cancelled');
  expect(enrollmentStatusLabel(EnrollmentStatus.Withdrawn)).toBe('Withdrawn');
 });
});
