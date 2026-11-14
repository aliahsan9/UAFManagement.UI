import { HttpClient,HttpParams } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTeachingRoomRequest,CreateTimetableEntryRequest,TeachingRoom,TimetableEntry } from './timetable.models';
@Injectable({providedIn:'root'})
export class TimetableService {
 private readonly http=inject(HttpClient);
 private readonly base=environment.apiBaseUrl+'/api/v1/timetable';
 getRooms(campusId?:string):Observable<TeachingRoom[]>{let params=new HttpParams();if(campusId)params=params.set('campusId',campusId);return this.http.get<TeachingRoom[]>(this.base+'/rooms',{params});}
 getRoom(id:string):Observable<TeachingRoom>{return this.http.get<TeachingRoom>(this.base+'/rooms/'+encodeURIComponent(id));}
 createRoom(request:CreateTeachingRoomRequest):Observable<{id:string}>{return this.http.post<{id:string}>(this.base+'/rooms',request);}
 getEntries(filters:{academicSessionId?:string;courseOfferingId?:string}={}):Observable<TimetableEntry[]>{let params=new HttpParams();if(filters.academicSessionId)params=params.set('academicSessionId',filters.academicSessionId);if(filters.courseOfferingId)params=params.set('courseOfferingId',filters.courseOfferingId);return this.http.get<TimetableEntry[]>(this.base+'/entries',{params});}
 getEntry(id:string):Observable<TimetableEntry>{return this.http.get<TimetableEntry>(this.base+'/entries/'+encodeURIComponent(id));}
 createEntry(request:CreateTimetableEntryRequest):Observable<{id:string}>{return this.http.post<{id:string}>(this.base+'/entries',request);}
 cancelEntry(id:string):Observable<void>{return this.http.delete<void>(this.base+'/entries/'+encodeURIComponent(id));}
}