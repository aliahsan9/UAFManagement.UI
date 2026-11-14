import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/services/api-client.service';
import { createIdempotencyKey } from '../../core/http/http-context.tokens';
import { StudentAcademicRecord } from '../grading/grading.models';
import { TranscriptIssued,TranscriptListItem,TranscriptVerification } from './transcripts.models';
@Injectable({providedIn:'root'})
export class TranscriptsService {
 private readonly api=inject(ApiClient);
 getMyAcademicRecord():Observable<StudentAcademicRecord>{return this.api.get<StudentAcademicRecord>('/api/v1/academic-records/me');}
 getMine():Observable<TranscriptListItem[]>{return this.api.get<TranscriptListItem[]>('/api/v1/academic-records/me/transcripts/');}
 downloadMyPdf(id:string):Observable<Blob>{return this.api.getBlob('/api/v1/academic-records/me/transcripts/'+encodeURIComponent(id)+'/pdf');}
 issueOfficial(studentId:string,key=createIdempotencyKey()):Observable<TranscriptIssued>{return this.api.post<TranscriptIssued>('/api/v1/transcripts/students/'+encodeURIComponent(studentId)+'/issue',null,{idempotencyKey:key});}
 verify(code:string):Observable<TranscriptVerification>{return this.api.get<TranscriptVerification>('/api/v1/transcripts/verify/'+encodeURIComponent(code));}
}
