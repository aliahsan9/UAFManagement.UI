export interface CreateFeeHeadRequest { code:string; name:string; isMandatory:boolean; }
export interface FeeHeadOption { id:string; code:string; name:string; isMandatory:boolean; }
export interface FeeStructureItemRequest { feeHeadId:string; amount:number; }
export interface CreateFeeStructureRequest { academicProgramId:string; academicSessionId:string; semesterNumber:number; name:string; items:FeeStructureItemRequest[]; }
export interface GenerateFeeChallanRequest { studentId:string; feeStructureId:string; issueDate:string; dueDate:string; lateFeeAmount:number; }
export interface RecordFeePaymentRequest { amount:number; method:string; referenceNumber:string; }
export interface VerifyFeePaymentRequest { approve:boolean; remarks:string|null; }
export interface CreatedResource { id:string; }
export interface FeeChallan { id:string; challanNumber:string; issueDate:string; dueDate:string; subtotal:number; lateFeeAmount:number; totalAmount:number; currencyCode:string; status:string; }
export interface FeePayment { id:string; challanId:string; amount:number; method:string; referenceNumber:string; status:string; verifiedByUserId:string|null; verifiedAtUtc:string|null; verificationRemarks:string|null; }
export interface StudentFeeAccount { studentId:string; totalOutstanding:number; challans:FeeChallan[]; payments:FeePayment[]; }
export interface FeeStructureDraft { id:string; name:string; academicProgramId:string; academicSessionId:string; semesterNumber:number; items:FeeStructureItemRequest[]; isPublished:boolean; }
export type FeeTab='overview'|'heads'|'structures'|'challans'|'accounts';
export function paymentStatusLabel(status:string):string { const key=status.toLowerCase(); return ({pending:'Pending verification',pendingverification:'Pending verification',verified:'Verified',rejected:'Rejected'} as Record<string,string>)[key]??status; }
export function challanStatusLabel(status:string):string { const key=status.toLowerCase(); return ({issued:'Issued / unpaid',partiallypaid:'Partially paid',paid:'Paid',overdue:'Overdue',cancelled:'Cancelled'} as Record<string,string>)[key]??status; }
export function isPaymentPending(status:string):boolean { return ['pending','pendingverification'].includes(status.toLowerCase()); }
