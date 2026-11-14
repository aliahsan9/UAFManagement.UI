import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController,provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach,beforeEach,describe,expect,it } from 'vitest';
import { environment } from '../../../environments/environment';
import { TranscriptsService } from './transcripts.service';
describe('TranscriptsService API contracts',()=>{
 let api:TranscriptsService;let http:HttpTestingController;const base=environment.apiBaseUrl;
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});api=TestBed.inject(TranscriptsService);http=TestBed.inject(HttpTestingController);});
 afterEach(()=>http.verify());
 it('loads the authenticated academic record and transcript list',()=>{api.getMyAcademicRecord().subscribe();http.expectOne(base+'/api/v1/academic-records/me').flush({semesters:[],courseAttempts:[]});api.getMine().subscribe();http.expectOne(base+'/api/v1/academic-records/me/transcripts/').flush([]);});
 it('downloads a transcript PDF as a binary response',()=>{api.downloadMyPdf('transcript-1').subscribe();const req=http.expectOne(base+'/api/v1/academic-records/me/transcripts/transcript-1/pdf');expect(req.request.method).toBe('GET');expect(req.request.responseType).toBe('blob');req.flush(new Blob(['%PDF-1.4'],{type:'application/pdf'}));});
 it('issues an official transcript for the selected student',()=>{api.issueOfficial('student-1').subscribe();const req=http.expectOne(base+'/api/v1/transcripts/students/student-1/issue');expect(req.request.method).toBe('POST');expect(req.request.body).toBeNull();req.flush({id:'transcript-1',verificationCode:'A'.repeat(32),snapshotSha256:'B'.repeat(64)});});
 it('verifies a transcript using the public anonymous endpoint',()=>{api.verify('A'.repeat(32)).subscribe();const req=http.expectOne(base+'/api/v1/transcripts/verify/'+'A'.repeat(32));expect(req.request.method).toBe('GET');req.flush({isAuthentic:true,registrationNumber:'UAF-2024-001',issuedAtUtc:'2026-11-14T10:00:00Z',snapshotSha256:'B'.repeat(64)});});
});
