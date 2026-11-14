import { describe,expect,it } from 'vitest';
import { GradeAppealStatus,GradeRevisionStatus,RepeatCoursePolicy,appealStatusLabel,appealStatusValue,revisionStatusLabel,revisionStatusValue } from './grading.models';
describe('Grading backend enum contracts',()=>{
 it('maps repeat course GPA policies',()=>{expect(RepeatCoursePolicy.AllAttempts).toBe(1);expect(RepeatCoursePolicy.LatestAttempt).toBe(2);expect(RepeatCoursePolicy.HighestGrade).toBe(3);});
 it('normalizes appeal statuses from numeric and named JSON values',()=>{expect([1,2,3].map(appealStatusValue)).toEqual([GradeAppealStatus.Pending,GradeAppealStatus.Approved,GradeAppealStatus.Rejected]);expect(appealStatusValue('Approved')).toBe(GradeAppealStatus.Approved);expect(appealStatusLabel(3)).toBe('Rejected');});
 it('normalizes revision statuses from numeric and named JSON values',()=>{expect([1,2,3].map(revisionStatusValue)).toEqual([GradeRevisionStatus.PendingApproval,GradeRevisionStatus.Approved,GradeRevisionStatus.Rejected]);expect(revisionStatusValue('PendingApproval')).toBe(GradeRevisionStatus.PendingApproval);expect(revisionStatusLabel(2)).toBe('Approved');});
});
