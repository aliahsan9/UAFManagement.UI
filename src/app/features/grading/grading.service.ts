import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AcademicRecordCourse,CreateGradeAppealRequest,CreateGradeRevisionRequest,CreateGradeScaleRequest,CourseGrade,DecideGradeAppealRequest,DecideGradeRevisionRequest,GradeAppeal,GradeAppealAudit,GradeRevision,GradeRevisionDecision,GradeRevisionRequest,GradeScale,StudentAcademicRecord } from './grading.models';
@Injectable({providedIn:'root'})
export class GradingService {
 private readonly http=inject(HttpClient);private readonly base=environment.apiBaseUrl;
 private readonly grading=this.base+'/api/v1/grading';
 private readonly records=this.base+'/api/v1/academic-records';
 getScaleForSession(sessionId:string):Observable<GradeScale>{return this.http.get<GradeScale>(this.grading+'/scales/sessions/'+encodeURIComponent(sessionId));}
 createScale(request:CreateGradeScaleRequest):Observable<GradeScale>{return this.http.post<GradeScale>(this.grading+'/scales/',request);}
 publishScale(scaleId:string):Observable<GradeScale>{return this.http.post<GradeScale>(this.grading+'/scales/'+encodeURIComponent(scaleId)+'/publish',null);}
 finalizeCourseGrade(offeringId:string,studentId:string):Observable<CourseGrade>{return this.http.post<CourseGrade>(this.grading+'/offerings/'+encodeURIComponent(offeringId)+'/students/'+encodeURIComponent(studentId)+'/finalize',null);}
 getMyAcademicRecord():Observable<StudentAcademicRecord>{return this.http.get<StudentAcademicRecord>(this.records+'/me');}
 createMyAppeal(request:CreateGradeAppealRequest):Observable<GradeAppeal>{return this.http.post<GradeAppeal>(this.records+'/me/grade-appeals/',request);}
 getMyAppeals():Observable<GradeAppeal[]>{return this.http.get<GradeAppeal[]>(this.records+'/me/grade-appeals/');}
 getPendingAppeals():Observable<GradeAppeal[]>{return this.http.get<GradeAppeal[]>(this.grading+'/grade-appeals/pending');}
 getAppealHistory(appealId:string):Observable<GradeAppealAudit[]>{return this.http.get<GradeAppealAudit[]>(this.grading+'/grade-appeals/'+encodeURIComponent(appealId)+'/history');}
 decideAppeal(appealId:string,request:DecideGradeAppealRequest):Observable<GradeAppeal>{return this.http.post<GradeAppeal>(this.grading+'/grade-appeals/'+encodeURIComponent(appealId)+'/decision',request);}
 requestRevision(gradeId:string,request:CreateGradeRevisionRequest):Observable<{id:string;status:string}>{return this.http.post<{id:string;status:string}>(this.grading+'/grades/'+encodeURIComponent(gradeId)+'/revision-requests',request);}
 getPendingRevisions():Observable<GradeRevisionRequest[]>{return this.http.get<GradeRevisionRequest[]>(this.grading+'/revision-requests/pending');}
 decideRevision(requestId:string,request:DecideGradeRevisionRequest):Observable<GradeRevisionDecision>{return this.http.post<GradeRevisionDecision>(this.grading+'/revision-requests/'+encodeURIComponent(requestId)+'/decision',request);}
 getMyRevisionRequests(gradeId:string):Observable<GradeRevisionRequest[]>{return this.http.get<GradeRevisionRequest[]>(this.records+'/me/course-grades/'+encodeURIComponent(gradeId)+'/revision-requests');}
 getMyRevisionHistory(gradeId:string):Observable<GradeRevision[]>{return this.http.get<GradeRevision[]>(this.records+'/me/course-grades/'+encodeURIComponent(gradeId)+'/revisions');}
}
