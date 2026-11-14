import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttendancePolicy,AttendanceSession,ConfigureAttendancePolicyRequest,CourseAttendanceReport,CreateAttendanceSessionRequest,MarkAttendanceRequest } from './attendance.models';
@Injectable({providedIn:'root'})
export class AttendanceService {
 private readonly http=inject(HttpClient);private readonly base=environment.apiBaseUrl+'/api/v1/attendance';
 createSession(request:CreateAttendanceSessionRequest):Observable<{id:string}>{return this.http.post<{id:string}>(this.base+'/sessions',request);}
 getSession(id:string):Observable<AttendanceSession>{return this.http.get<AttendanceSession>(this.base+'/sessions/'+encodeURIComponent(id));}
 markAttendance(id:string,request:MarkAttendanceRequest):Observable<void>{return this.http.put<void>(this.base+'/sessions/'+encodeURIComponent(id)+'/marks',request);}
 finalizeSession(id:string):Observable<void>{return this.http.post<void>(this.base+'/sessions/'+encodeURIComponent(id)+'/finalize',null);}
 getPolicy(academicSessionId:string):Observable<AttendancePolicy>{return this.http.get<AttendancePolicy>(this.base+'/policies/'+encodeURIComponent(academicSessionId));}
 configurePolicy(academicSessionId:string,request:ConfigureAttendancePolicyRequest):Observable<AttendancePolicy>{return this.http.put<AttendancePolicy>(this.base+'/policies/'+encodeURIComponent(academicSessionId),request);}
 getOfferingReport(offeringId:string):Observable<CourseAttendanceReport>{return this.http.get<CourseAttendanceReport>(this.base+'/offerings/'+encodeURIComponent(offeringId)+'/report');}
}