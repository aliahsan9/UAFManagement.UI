import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateFeeHeadRequest,CreateFeeStructureRequest,CreatedResource,FeeStructureDraft,GenerateFeeChallanRequest,RecordFeePaymentRequest,StudentFeeAccount,VerifyFeePaymentRequest } from './finance.models';
@Injectable({providedIn:'root'})
export class FinanceService {
 private readonly http=inject(HttpClient);
 private readonly base=environment.apiBaseUrl+'/api/v1/finance';
 createFeeHead(request:CreateFeeHeadRequest):Observable<CreatedResource>{return this.http.post<CreatedResource>(this.base+'/fee-heads',request);}
 createFeeStructure(request:CreateFeeStructureRequest):Observable<CreatedResource>{return this.http.post<CreatedResource>(this.base+'/fee-structures',request);}
 publishFeeStructure(id:string):Observable<void>{return this.http.post<void>(this.base+'/fee-structures/'+encodeURIComponent(id)+'/publish',null);}
 generateChallan(request:GenerateFeeChallanRequest):Observable<CreatedResource>{return this.http.post<CreatedResource>(this.base+'/challans',request);}
 getStudentAccount(studentId:string):Observable<StudentFeeAccount>{return this.http.get<StudentFeeAccount>(this.base+'/students/'+encodeURIComponent(studentId)+'/account');}
 recordPayment(challanId:string,request:RecordFeePaymentRequest):Observable<CreatedResource>{return this.http.post<CreatedResource>(this.base+'/challans/'+encodeURIComponent(challanId)+'/payments',request);}
 verifyPayment(paymentId:string,request:VerifyFeePaymentRequest):Observable<void>{return this.http.post<void>(this.base+'/payments/'+encodeURIComponent(paymentId)+'/verification',request);}
}
