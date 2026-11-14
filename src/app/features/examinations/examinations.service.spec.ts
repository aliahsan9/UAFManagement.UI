import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController,provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach,beforeEach,describe,expect,it } from 'vitest';
import { environment } from '../../../environments/environment';
import { ExaminationsService } from './examinations.service';

describe('ExaminationsService',()=>{
 let api:ExaminationsService;let http:HttpTestingController;const base=environment.apiBaseUrl+'/api/v1/examinations';
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});api=TestBed.inject(ExaminationsService);http=TestBed.inject(HttpTestingController);});
 afterEach(()=>http.verify());
 it('creates an examination using the backend request contract',()=>{const body={courseOfferingId:'offering-1',title:'Midterm',type:3,scheduledDate:'2026-11-20',maximumMarks:50,passingMarks:20,weightPercentage:30};api.create(body).subscribe();const req=http.expectOne(base+'/');expect(req.request.method).toBe('POST');expect(req.request.body).toEqual(body);req.flush({id:'exam-1'});});
 it('lists examinations by course offering and loads details',()=>{api.getForOffering('offering-1').subscribe();const list=http.expectOne(base+'/offerings/offering-1');expect(list.request.method).toBe('GET');list.flush([]);api.get('exam-1').subscribe();const detail=http.expectOne(base+'/exam-1');expect(detail.request.method).toBe('GET');detail.flush({id:'exam-1'});});
 it('uses separate lifecycle endpoints for scheduling and marks entry',()=>{api.schedule('exam-1').subscribe();const schedule=http.expectOne(base+'/exam-1/schedule');expect(schedule.request.method).toBe('POST');schedule.flush(null);api.openMarksEntry('exam-1').subscribe();const open=http.expectOne(base+'/exam-1/open-marks-entry');expect(open.request.method).toBe('POST');open.flush(null);});
 it('saves marks with absent, remarks and audit reason fields',()=>{const body={marks:[{studentId:'student-1',marksObtained:0,isAbsent:true,remarks:'Absent',reason:'Initial marks entry'}]};api.saveMarks('exam-1',body).subscribe();const req=http.expectOne(base+'/exam-1/marks');expect(req.request.method).toBe('PUT');expect(req.request.body).toEqual(body);req.flush(null);});
 it('keeps submit, approval and publication as distinct commands',()=>{api.submit('exam-1').subscribe();const submit=http.expectOne(base+'/exam-1/submit');expect(submit.request.method).toBe('POST');submit.flush(null);api.approve('exam-1').subscribe();const approve=http.expectOne(base+'/exam-1/approve');expect(approve.request.method).toBe('POST');approve.flush(null);api.publish('exam-1').subscribe();const publish=http.expectOne(base+'/exam-1/publish');expect(publish.request.method).toBe('POST');publish.flush(null);});
 it('loads results only through the published-results endpoint',()=>{api.getResults('exam-1').subscribe();const req=http.expectOne(base+'/exam-1/results');expect(req.request.method).toBe('GET');req.flush([]);});
});
