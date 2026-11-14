import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiClient } from '../../core/services/api-client.service';
import { createIdempotencyKey } from '../../core/http/http-context.tokens';
import {
 AdmissionApplication, ApplicantAcademicProgram, AdmissionDecisionAudit, AdmissionDocument, ConfigureRegistrationSeries,
 ConvertedStudent, CreateApplicantDraft, SubmissionReadiness, StaffApplicationPage,
 StaffAdmissionApplication, UpdateApplicantDraft, AdmissionStatus
} from './admissions.models';

@Injectable({providedIn:'root'})
export class AdmissionsService {
 private readonly http=inject(HttpClient);
 private readonly api=inject(ApiClient);
 private readonly applicantUrl=environment.apiBaseUrl+'/api/v1/applicant/admissions';
 private readonly staffUrl=environment.apiBaseUrl+'/api/v1/admissions';

 getApplicantPrograms():Observable<ApplicantAcademicProgram[]>{return this.http.get<ApplicantAcademicProgram[]>(this.applicantUrl+'/programs');}
 getMyApplications():Observable<AdmissionApplication[]>{return this.http.get<AdmissionApplication[]>(this.applicantUrl+'/');}
 getMyApplication(id:string):Observable<AdmissionApplication>{return this.http.get<AdmissionApplication>(this.applicantUrl+'/'+encodeURIComponent(id));}
 createApplicantDraft(request:CreateApplicantDraft,key=createIdempotencyKey()):Observable<AdmissionApplication>{return this.api.post<AdmissionApplication>('/api/v1/applicant/admissions/',request,{idempotencyKey:key});}
 updateApplicantDraft(id:string,request:UpdateApplicantDraft):Observable<void>{return this.http.put<void>(this.applicantUrl+'/'+encodeURIComponent(id),request);}
 getReadiness(id:string):Observable<SubmissionReadiness>{return this.http.get<SubmissionReadiness>(this.applicantUrl+'/'+encodeURIComponent(id)+'/submission-readiness');}
 submitApplicantApplication(id:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/applicant/admissions/'+encodeURIComponent(id)+'/submit',null,{idempotencyKey:key});}
 withdrawApplicantApplication(id:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/applicant/admissions/'+encodeURIComponent(id)+'/withdraw',null,{idempotencyKey:key});}
 getMyDocuments(id:string):Observable<AdmissionDocument[]>{return this.http.get<AdmissionDocument[]>(this.applicantUrl+'/'+encodeURIComponent(id)+'/documents');}
 uploadDocument(id:string,type:number,file:File):Observable<AdmissionDocument>{
  const body=new FormData();body.append('DocumentType',String(type));body.append('File',file,file.name);
  return this.http.post<AdmissionDocument>(this.applicantUrl+'/'+encodeURIComponent(id)+'/documents',body);
 }
 downloadMyDocument(applicationId:string,documentId:string):Observable<Blob>{
  return this.http.get(this.applicantUrl+'/'+encodeURIComponent(applicationId)+'/documents/'+encodeURIComponent(documentId)+'/download',{responseType:'blob'});
 }

 getStaffApplications(filters:{status?:AdmissionStatus;academicProgramId?:string;search?:string;page?:number;pageSize?:number}={}):Observable<StaffApplicationPage>{
  let params=new HttpParams();Object.entries(filters).forEach(([key,value])=>{if(value!==undefined&&value!==null&&value!=='')params=params.set(key,String(value));});
  return this.http.get<StaffApplicationPage>(this.staffUrl+'/',{params});
 }
 getStaffApplication(id:string):Observable<StaffAdmissionApplication>{return this.http.get<StaffAdmissionApplication>(this.staffUrl+'/'+encodeURIComponent(id));}
 createStaffDraft(request:{applicationNumber:string;applicantFullName:string;applicantEmail:string;academicProgramId:string;applicationDate:string;phoneNumber:string|null},key=createIdempotencyKey()):Observable<{applicationId:string}>{return this.api.post<{applicationId:string}>('/api/v1/admissions/',request,{idempotencyKey:key});}
 submitStaffApplication(id:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/admissions/'+encodeURIComponent(id)+'/submit',null,{idempotencyKey:key});}
 startReview(id:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/admissions/'+encodeURIComponent(id)+'/start-review',null,{idempotencyKey:key});}
 recordDecision(id:string,decision:'accept'|'reject'|'waitlist',remarks:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/admissions/'+encodeURIComponent(id)+'/'+decision,{remarks},{idempotencyKey:key});}
 withdrawStaffApplication(id:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/admissions/'+encodeURIComponent(id)+'/withdraw',null,{idempotencyKey:key});}
 getDecisionHistory(id:string):Observable<AdmissionDecisionAudit[]>{return this.http.get<AdmissionDecisionAudit[]>(this.staffUrl+'/'+encodeURIComponent(id)+'/decision-history');}
 configureRegistrationSeries(request:ConfigureRegistrationSeries,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/admissions/registration-series',request,{idempotencyKey:key});}
 convertToStudent(id:string,key=createIdempotencyKey()):Observable<ConvertedStudent>{return this.api.post<ConvertedStudent>('/api/v1/admissions/'+encodeURIComponent(id)+'/convert-to-student',null,{idempotencyKey:key});}
 getStaffDocuments(applicationId:string):Observable<AdmissionDocument[]>{return this.http.get<AdmissionDocument[]>(environment.apiBaseUrl+'/api/v1/admissions/documents/application/'+encodeURIComponent(applicationId));}
 downloadStaffDocument(documentId:string):Observable<Blob>{return this.http.get(environment.apiBaseUrl+'/api/v1/admissions/documents/'+encodeURIComponent(documentId)+'/download',{responseType:'blob'});}
 verifyDocument(documentId:string,remarks:string|null,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/admissions/documents/'+encodeURIComponent(documentId)+'/verify',{remarks},{idempotencyKey:key});}
 rejectDocument(documentId:string,remarks:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/admissions/documents/'+encodeURIComponent(documentId)+'/reject',{remarks},{idempotencyKey:key});}
}
