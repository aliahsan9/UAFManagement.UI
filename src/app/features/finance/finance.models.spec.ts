import { describe,expect,it } from 'vitest';
import { challanStatusLabel,isPaymentPending,paymentStatusLabel } from './finance.models';
describe('Finance status contracts',()=>{
 it('maps the actual fee payment enum names',()=>{expect(isPaymentPending('PendingVerification')).toBe(true);expect(isPaymentPending('Verified')).toBe(false);expect(paymentStatusLabel('PendingVerification')).toBe('Pending verification');expect(paymentStatusLabel('Rejected')).toBe('Rejected');});
 it('maps the actual challan enum names',()=>{expect(challanStatusLabel('Issued')).toBe('Issued / unpaid');expect(challanStatusLabel('PartiallyPaid')).toBe('Partially paid');expect(challanStatusLabel('Paid')).toBe('Paid');expect(challanStatusLabel('Cancelled')).toBe('Cancelled');});
});
