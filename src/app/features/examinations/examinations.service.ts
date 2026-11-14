import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateExaminationRequest,Examination,ExaminationListItem,ExaminationResult,SaveExaminationMarksRequest } from './examinations.models';

@Injectable({providedIn:'root'})
export class ExaminationsService {
 private readonly http=inject(HttpClient);
 private readonly base=environment.apiBaseUrl+'/api/v1/examinations';
 create(request:CreateExaminationRequest):Observable<{id:string}>{return this.http.post<{id:string}>(this.base+'/',request);}
 get(id:string):Observable<Examination>{return this.http.get<Examination>(this.base+'/'+encodeURIComponent(id));}
 getForOffering(offeringId:string):Observable<ExaminationListItem[]>{return this.http.get<ExaminationListItem[]>(this.base+'/offerings/'+encodeURIComponent(offeringId));}
 schedule(id:string):Observable<void>{return this.http.post<void>(this.base+'/'+encodeURIComponent(id)+'/schedule',null);}
 openMarksEntry(id:string):Observable<void>{return this.http.post<void>(this.base+'/'+encodeURIComponent(id)+'/open-marks-entry',null);}
 saveMarks(id:string,request:SaveExaminationMarksRequest):Observable<void>{return this.http.put<void>(this.base+'/'+encodeURIComponent(id)+'/marks',request);}
 submit(id:string):Observable<void>{return this.http.post<void>(this.base+'/'+encodeURIComponent(id)+'/submit',null);}
 approve(id:string):Observable<void>{return this.http.post<void>(this.base+'/'+encodeURIComponent(id)+'/approve',null);}
 publish(id:string):Observable<void>{return this.http.post<void>(this.base+'/'+encodeURIComponent(id)+'/publish',null);}
 getResults(id:string):Observable<ExaminationResult[]>{return this.http.get<ExaminationResult[]>(this.base+'/'+encodeURIComponent(id)+'/results');}
}
