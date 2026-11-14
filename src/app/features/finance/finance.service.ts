import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/services/api-client.service';
import { createIdempotencyKey } from '../../core/http/http-context.tokens';
import { CreateFeeHeadRequest,CreateFeeStructureRequest,CreatedResource,GenerateFeeChallanRequest,RecordFeePaymentRequest,StudentFeeAccount,VerifyFeePaymentRequest } from './finance.models';
export interface FinanceDashboardAnalytics { generatedAtUtc:string; students:{total:number;active:number}; finance:{outstandingBalance:number;currency:string}; }
@Injectable({providedIn:'root'})
export class FinanceService {
 private readonly api=inject(ApiClient);
 getDashboard():Observable<FinanceDashboardAnalytics>{return this.api.get<FinanceDashboardAnalytics>('/api/v1/analytics/dashboard');}
 createFeeHead(request:CreateFeeHeadRequest,key=createIdempotencyKey()):Observable<CreatedResource>{return this.api.post<CreatedResource>('/api/v1/finance/fee-heads',request,{idempotencyKey:key});}
 createFeeStructure(request:CreateFeeStructureRequest,key=createIdempotencyKey()):Observable<CreatedResource>{return this.api.post<CreatedResource>('/api/v1/finance/fee-structures',request,{idempotencyKey:key});}
 publishFeeStructure(id:string,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/finance/fee-structures/'+encodeURIComponent(id)+'/publish',null,{idempotencyKey:key});}
 generateChallan(request:GenerateFeeChallanRequest,key=createIdempotencyKey()):Observable<CreatedResource>{return this.api.post<CreatedResource>('/api/v1/finance/challans',request,{idempotencyKey:key});}
 getStudentAccount(studentId:string):Observable<StudentFeeAccount>{return this.api.get<StudentFeeAccount>('/api/v1/finance/students/'+encodeURIComponent(studentId)+'/account');}
 recordPayment(challanId:string,request:RecordFeePaymentRequest,key=createIdempotencyKey()):Observable<CreatedResource>{return this.api.post<CreatedResource>('/api/v1/finance/challans/'+encodeURIComponent(challanId)+'/payments',request,{idempotencyKey:key});}
 verifyPayment(paymentId:string,request:VerifyFeePaymentRequest,key=createIdempotencyKey()):Observable<void>{return this.api.post<void>('/api/v1/finance/payments/'+encodeURIComponent(paymentId)+'/verification',request,{idempotencyKey:key});}
}
