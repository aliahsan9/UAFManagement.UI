import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/services/api-client.service';
import { createIdempotencyKey } from '../../core/http/http-context.tokens';
import { AttendancePolicy,AttendanceSession,ConfigureAttendancePolicyRequest,CourseAttendanceReport,CreateAttendanceSessionRequest,MarkAttendanceRequest } from './attendance.models';
@Injectable({providedIn:'root'})
export class AttendanceService {
 private readonly api=inject(ApiClient);
 createSession(request:CreateAttendanceSessionRequest,key=createIdempotencyKey()):Observable<{id:string}>{return this.api.post<{id:string}>('/api/v1/attendance/sessions',request,{idempotencyKey:key});}
 getSession(id:string):Observable<AttendanceSession>{return this.api.get<AttendanceSession>('/api/v1/attendance/sessions/'+encodeURIComponent(id));}
 markAttendance(id:string,request:MarkAttendanceRequest):Observable<void>{return this.api.put<void>('/api/v1/attendance/sessions/'+encodeURIComponent(id)+'/marks',request);}
 finalizeSession(id:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/attendance/sessions/'+encodeURIComponent(id)+'/finalize',null,{idempotencyKey:key});}
 getPolicy(academicSessionId:string):Observable<AttendancePolicy>{return this.api.get<AttendancePolicy>('/api/v1/attendance/policies/'+encodeURIComponent(academicSessionId));}
 configurePolicy(academicSessionId:string,request:ConfigureAttendancePolicyRequest):Observable<AttendancePolicy>{return this.api.put<AttendancePolicy>('/api/v1/attendance/policies/'+encodeURIComponent(academicSessionId),request);}
 getOfferingReport(offeringId:string):Observable<CourseAttendanceReport>{return this.api.get<CourseAttendanceReport>('/api/v1/attendance/offerings/'+encodeURIComponent(offeringId)+'/report');}
}
