import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController,provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach,beforeEach,describe,expect,it } from 'vitest';
import { environment } from '../../../environments/environment';
import { FinanceService } from './finance.service';
describe('FinanceService API contracts',()=>{
 let service:FinanceService;let http:HttpTestingController;const base=environment.apiBaseUrl+'/api/v1/finance';
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});service=TestBed.inject(FinanceService);http=TestBed.inject(HttpTestingController);});
 afterEach(()=>http.verify());
 it('loads the university analytics snapshot for finance overview',()=>{service.getDashboard().subscribe();const req=http.expectOne(base.replace('/api/v1/finance','')+'/api/v1/analytics/dashboard');expect(req.request.method).toBe('GET');req.flush({students:{total:120,active:110},finance:{outstandingBalance:150000,currency:'PKR'}});});\n it('creates fee heads and fee structures with backend request shapes',()=>{
  service.createFeeHead({code:'TUIT',name:'Tuition Fee',isMandatory:true}).subscribe();let req=http.expectOne(base+'/fee-heads');expect(req.request.method).toBe('POST');expect(req.request.body).toEqual({code:'TUIT',name:'Tuition Fee',isMandatory:true});req.flush({id:'head-1'});
  service.createFeeStructure({academicProgramId:'program-1',academicSessionId:'session-1',semesterNumber:1,name:'BSCS Semester 1',items:[{feeHeadId:'head-1',amount:25000}]}).subscribe();req=http.expectOne(base+'/fee-structures');expect(req.request.method).toBe('POST');expect(req.request.body.items[0]).toEqual({feeHeadId:'head-1',amount:25000});req.flush({id:'structure-1'});
 });
 it('publishes a structure using the dedicated action endpoint',()=>{service.publishFeeStructure('structure-1').subscribe();const req=http.expectOne(base+'/fee-structures/structure-1/publish');expect(req.request.method).toBe('POST');expect(req.request.body).toBeNull();req.flush(null);});
 it('generates a challan and reads the student account',()=>{
  service.generateChallan({studentId:'student-1',feeStructureId:'structure-1',issueDate:'2026-11-01',dueDate:'2026-11-15',lateFeeAmount:0}).subscribe();let req=http.expectOne(base+'/challans');expect(req.request.method).toBe('POST');expect(req.request.body.dueDate).toBe('2026-11-15');req.flush({id:'challan-1'});
  service.getStudentAccount('student-1').subscribe();req=http.expectOne(base+'/students/student-1/account');expect(req.request.method).toBe('GET');req.flush({studentId:'student-1',totalOutstanding:25000,challans:[],payments:[]});
 });
 it('records payment against a challan and verifies it separately',()=>{
  service.recordPayment('challan-1',{amount:1000,method:'BankTransfer',referenceNumber:'TXN-1'}).subscribe();let req=http.expectOne(base+'/challans/challan-1/payments');expect(req.request.method).toBe('POST');expect(req.request.body.amount).toBe(1000);req.flush({id:'payment-1'});
  service.verifyPayment('payment-1',{approve:true,remarks:'Bank statement checked'}).subscribe();req=http.expectOne(base+'/payments/payment-1/verification');expect(req.request.method).toBe('POST');expect(req.request.body).toEqual({approve:true,remarks:'Bank statement checked'});req.flush(null);
 });
});
