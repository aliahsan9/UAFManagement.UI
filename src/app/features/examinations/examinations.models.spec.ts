import { describe,expect,it } from 'vitest';
import { ExaminationStatus,ExaminationType,examinationStatusLabel,examinationStatusValue,examinationTypeLabel,examinationTypeValue } from './examinations.models';
describe('Examination enum contracts',()=>{
 it('maps every backend examination type value',()=>{expect([1,2,3,4,5,6].map(examinationTypeValue)).toEqual([ExaminationType.Quiz,ExaminationType.Assignment,ExaminationType.Midterm,ExaminationType.Final,ExaminationType.Practical,ExaminationType.Project]);});
 it('normalizes named and numeric examination types',()=>{expect(examinationTypeValue('Midterm')).toBe(ExaminationType.Midterm);expect(examinationTypeLabel(6)).toBe('Project');});
 it('maps every backend examination lifecycle state',()=>{expect([1,2,3,4,5,6,7].map(examinationStatusValue)).toEqual([ExaminationStatus.Draft,ExaminationStatus.Scheduled,ExaminationStatus.MarksEntryOpen,ExaminationStatus.Submitted,ExaminationStatus.Approved,ExaminationStatus.Published,ExaminationStatus.Cancelled]);});
 it('normalizes lifecycle names and labels',()=>{expect(examinationStatusValue('MarksEntryOpen')).toBe(ExaminationStatus.MarksEntryOpen);expect(examinationStatusLabel(6)).toBe('Published');});
});
