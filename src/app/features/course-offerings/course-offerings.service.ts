import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseEnrollment, CourseOffering, CreateCourseOfferingRequest, EnrollStudentRequest, TeachingRoom, TimetableEntry, UpdateCourseOfferingRequest } from './course-offerings.models';

@Injectable({providedIn:'root'})
export class CourseOfferingsService {
 private readonly http=inject(HttpClient);
 private readonly offeringsUrl=environment.apiBaseUrl+'/api/v1/course-offerings';
 private readonly enrollmentsUrl=environment.apiBaseUrl+'/api/v1/course-enrollments';
 private readonly timetableUrl=environment.apiBaseUrl+'/api/v1/timetable';

 getOfferings(filters:{academicSessionId?:string;courseId?:string;status?:number}={}):Observable<CourseOffering[]>{
  let params=new HttpParams();
  if(filters.academicSessionId)params=params.set('academicSessionId',filters.academicSessionId);
  if(filters.courseId)params=params.set('courseId',filters.courseId);
  if(filters.status!==undefined)params=params.set('status',filters.status);
  return this.http.get<CourseOffering[]>(this.offeringsUrl+'/',{params});
 }
 getOffering(id:string):Observable<CourseOffering>{return this.http.get<CourseOffering>(this.offeringsUrl+'/'+encodeURIComponent(id));}
 createOffering(request:CreateCourseOfferingRequest):Observable<{id:string}>{return this.http.post<{id:string}>(this.offeringsUrl+'/',request);}
 updateOffering(id:string,request:UpdateCourseOfferingRequest):Observable<void>{return this.http.put<void>(this.offeringsUrl+'/'+encodeURIComponent(id),request);}
 publish(id:string):Observable<void>{return this.http.post<void>(this.offeringsUrl+'/'+encodeURIComponent(id)+'/publish',null);}
 close(id:string):Observable<void>{return this.http.post<void>(this.offeringsUrl+'/'+encodeURIComponent(id)+'/close',null);}
 cancel(id:string):Observable<void>{return this.http.post<void>(this.offeringsUrl+'/'+encodeURIComponent(id)+'/cancel',null);}
 getEnrollments(offeringId:string):Observable<CourseEnrollment[]>{return this.http.get<CourseEnrollment[]>(this.offeringsUrl+'/'+encodeURIComponent(offeringId)+'/enrollments');}
 enrollStudent(offeringId:string,studentId:string,request:EnrollStudentRequest):Observable<{id:string}>{return this.http.post<{id:string}>(this.offeringsUrl+'/'+encodeURIComponent(offeringId)+'/enrollments/'+encodeURIComponent(studentId),request);}
 dropEnrollment(id:string):Observable<void>{return this.http.post<void>(this.enrollmentsUrl+'/'+encodeURIComponent(id)+'/drop',null);}
 withdrawEnrollment(id:string):Observable<void>{return this.http.post<void>(this.enrollmentsUrl+'/'+encodeURIComponent(id)+'/withdraw',null);}
 completeEnrollment(id:string):Observable<void>{return this.http.post<void>(this.enrollmentsUrl+'/'+encodeURIComponent(id)+'/complete',null);}
 getTimetableEntries(offeringId:string):Observable<TimetableEntry[]>{
  const params=new HttpParams().set('courseOfferingId',offeringId);
  return this.http.get<TimetableEntry[]>(this.timetableUrl+'/entries',{params});
 }
 getRoom(id:string):Observable<TeachingRoom>{return this.http.get<TeachingRoom>(this.timetableUrl+'/rooms/'+encodeURIComponent(id));}
}
