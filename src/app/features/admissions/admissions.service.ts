import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
 AdmissionApplication, ApplicantAcademicProgram, AdmissionDecisionAudit, AdmissionDocument, ConfigureRegistrationSeries,
 ConvertedStudent, CreateApplicantDraft, SubmissionReadiness, StaffApplicationPage,
 StaffAdmissionApplication, UpdateApplicantDraft, AdmissionStatus
} from './admissions.models';

@Injectable({providedIn:'root'})
export class AdmissionsService {
 private readonly http=inject(HttpClient);
 private readonly applicantUrl=environment.apiBaseUrl+'/api/v1/applicant/admissions';
 private readonly staffUrl=environment.apiBaseUrl+'/api/v1/admissions';

 getApplicantPrograms():Observable<ApplicantAcademicProgram[]>{return this.http.get<ApplicantAcademicProgram[]>(this.applicantUrl+'/programs');}
 getMyApplications():Observable<AdmissionApplication[]>{return this.http.get<AdmissionApplication[]>(this.applicantUrl+'/');}
 getMyApplication(id:string):Observable<AdmissionApplication>{return this.http.get<AdmissionApplication>(this.applicantUrl+'/'+encodeURIComponent(id));}
 createApplicantDraft(request:CreateApplicantDraft):Observable<AdmissionApplication>{return this.http.post<AdmissionApplication>(this.applicantUrl+'/',request);}
 updateApplicantDraft(id:string,request:UpdateApplicantDraft):Observable<void>{return this.http.put<void>(this.applicantUrl+'/'+encodeURIComponent(id),request);}
 getReadiness(id:string):Observable<SubmissionReadiness>{return this.http.get<SubmissionReadiness>(this.applicantUrl+'/'+encodeURIComponent(id)+'/submission-readiness');}
 submitApplicantApplication(id:string):Observable<void>{return this.http.post<void>(this.applicantUrl+'/'+encodeURIComponent(id)+'/submit',null);}
 withdrawApplicantApplication(id:string):Observable<void>{return this.http.post<void>(this.applicantUrl+'/'+encodeURIComponent(id)+'/withdraw',null);}
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
 createStaffDraft(request:{applicationNumber:string;applicantFullName:string;applicantEmail:string;academicProgramId:string;applicationDate:string;phoneNumber:string|null}):Observable<{applicationId:string}>{return this.http.post<{applicationId:string}>(this.staffUrl+'/',request);}
 submitStaffApplication(id:string):Observable<void>{return this.http.post<void>(this.staffUrl+'/'+encodeURIComponent(id)+'/submit',null);}
 startReview(id:string):Observable<void>{return this.http.post<void>(this.staffUrl+'/'+encodeURIComponent(id)+'/start-review',null);}
 recordDecision(id:string,decision:'accept'|'reject'|'waitlist',remarks:string):Observable<void>{return this.http.post<void>(this.staffUrl+'/'+encodeURIComponent(id)+'/'+decision,{remarks});}
 withdrawStaffApplication(id:string):Observable<void>{return this.http.post<void>(this.staffUrl+'/'+encodeURIComponent(id)+'/withdraw',null);}
 getDecisionHistory(id:string):Observable<AdmissionDecisionAudit[]>{return this.http.get<AdmissionDecisionAudit[]>(this.staffUrl+'/'+encodeURIComponent(id)+'/decision-history');}
 configureRegistrationSeries(request:ConfigureRegistrationSeries):Observable<void>{return this.http.post<void>(this.staffUrl+'/registration-series',request);}
 convertToStudent(id:string):Observable<ConvertedStudent>{return this.http.post<ConvertedStudent>(this.staffUrl+'/'+encodeURIComponent(id)+'/convert-to-student',null);}
 getStaffDocuments(applicationId:string):Observable<AdmissionDocument[]>{return this.http.get<AdmissionDocument[]>(environment.apiBaseUrl+'/api/v1/admissions/documents/application/'+encodeURIComponent(applicationId));}
 downloadStaffDocument(documentId:string):Observable<Blob>{return this.http.get(environment.apiBaseUrl+'/api/v1/admissions/documents/'+encodeURIComponent(documentId)+'/download',{responseType:'blob'});}
 verifyDocument(documentId:string,remarks:string|null):Observable<void>{return this.http.post<void>(environment.apiBaseUrl+'/api/v1/admissions/documents/'+encodeURIComponent(documentId)+'/verify',{remarks});}
 rejectDocument(documentId:string,remarks:string):Observable<void>{return this.http.post<void>(environment.apiBaseUrl+'/api/v1/admissions/documents/'+encodeURIComponent(documentId)+'/reject',{remarks});}
}
