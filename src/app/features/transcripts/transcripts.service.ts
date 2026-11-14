import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentAcademicRecord } from '../grading/grading.models';
import { TranscriptIssued,TranscriptListItem,TranscriptVerification } from './transcripts.models';

@Injectable({providedIn:'root'})
export class TranscriptsService {
 private readonly http=inject(HttpClient);
 private readonly base=environment.apiBaseUrl;
 private readonly records=this.base+'/api/v1/academic-records';
 private readonly transcripts=this.base+'/api/v1/transcripts';
 getMyAcademicRecord():Observable<StudentAcademicRecord>{return this.http.get<StudentAcademicRecord>(this.records+'/me');}
 getMine():Observable<TranscriptListItem[]>{return this.http.get<TranscriptListItem[]>(this.records+'/me/transcripts/');}
 downloadMyPdf(id:string):Observable<Blob>{return this.http.get(this.records+'/me/transcripts/'+encodeURIComponent(id)+'/pdf',{responseType:'blob'});}
 issueOfficial(studentId:string):Observable<TranscriptIssued>{return this.http.post<TranscriptIssued>(this.transcripts+'/students/'+encodeURIComponent(studentId)+'/issue',null);}
 verify(code:string):Observable<TranscriptVerification>{return this.http.get<TranscriptVerification>(this.transcripts+'/verify/'+encodeURIComponent(code));}
}
