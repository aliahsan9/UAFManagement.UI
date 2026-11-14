export enum RepeatCoursePolicy { AllAttempts=1, LatestAttempt=2, HighestGrade=3 }
export enum GradeAppealStatus { Pending=1, Approved=2, Rejected=3 }
export enum GradeRevisionStatus { PendingApproval=1, Approved=2, Rejected=3 }

export interface GradeBandInput { letterGrade:string; minimumPercentage:number; gradePoints:number; isPassing:boolean; }
export interface CreateGradeScaleRequest { academicSessionId:string; name:string; includeFailedCoursesInGpa:boolean; repeatCoursePolicy:RepeatCoursePolicy; bands:GradeBandInput[]; }
export interface GradeScaleBand extends GradeBandInput {}
export interface GradeScale { id:string; academicSessionId:string; name:string; includeFailedCoursesInGpa:boolean; repeatCoursePolicy:RepeatCoursePolicy|number|string; isPublished:boolean; bands:GradeScaleBand[]; }
export interface CourseGrade { id:string; studentId:string; registrationNumber:string; courseOfferingId:string; courseCode:string; courseTitle:string; creditHours:number; totalMarks:number; marksObtained:number; percentage:number; letterGrade:string; gradePoints:number; isPassed:boolean; finalizedAtUtc:string; }
export interface AcademicRecordCourse { gradeId:string; courseId:string; courseOfferingId:string; academicSessionId:string; academicSessionName:string; academicSessionStartDate:string; courseCode:string; courseTitle:string; creditHours:number; totalMarks:number; marksObtained:number; percentage:number; letterGrade:string; gradePoints:number; isPassed:boolean; includeFailedCoursesInGpa:boolean; repeatCoursePolicy:RepeatCoursePolicy|number|string; finalizedAtUtc:string; }
export interface SemesterGpa { academicSessionId:string; academicSessionName:string; gpa:number|null; gpaCreditHours:number; courses:AcademicRecordCourse[]; }
export interface StudentAcademicRecord { studentId:string; registrationNumber:string; fullName:string; semesters:SemesterGpa[]; cumulativeGpa:number|null; cumulativeGpaCreditHours:number; courseAttempts:AcademicRecordCourse[]; }
export interface GradeAppeal { id:string; studentCourseGradeId:string; studentId:string; registrationNumber:string; courseCode:string; courseTitle:string; academicSessionName:string; reason:string; status:GradeAppealStatus|number|string; submittedAtUtc:string; reviewedByUserId:string|null; reviewedAtUtc:string|null; reviewRemarks:string|null; }
export interface GradeAppealAudit { id:string; appealId:string; previousStatus:GradeAppealStatus|number|string; newStatus:GradeAppealStatus|number|string; actorId:string; remarks:string; occurredAtUtc:string; }
export interface CreateGradeAppealRequest { studentCourseGradeId:string; reason:string; }
export interface DecideGradeAppealRequest { approve:boolean; remarks:string; }
export interface GradeRevisionRequest { id:string; studentCourseGradeId:string; appealId:string; studentId:string; registrationNumber:string; courseCode:string; courseTitle:string; currentMarks:number; proposedMarks:number; reason:string; status:GradeRevisionStatus|number|string; requestedByUserId:string; requestedAtUtc:string; reviewedByUserId:string|null; reviewedAtUtc:string|null; reviewRemarks:string|null; }
export interface GradeRevision { id:string; studentCourseGradeId:string; revisionNumber:number; previousMarks:number; newMarks:number; previousPercentage:number; newPercentage:number; previousLetterGrade:string; newLetterGrade:string; previousGradePoints:number; newGradePoints:number; previousIsPassed:boolean; newIsPassed:boolean; reason:string; requestedByUserId:string; approvedByUserId:string; approvedAtUtc:string; }
export interface GradeRevisionDecision { requestId:string; status:GradeRevisionStatus|number|string; revision:GradeRevision|null; }
export interface CreateGradeRevisionRequest { appealId:string; proposedMarksObtained:number; reason:string; }
export interface DecideGradeRevisionRequest { approve:boolean; remarks:string; }

export const REPEAT_COURSE_POLICIES=[{value:RepeatCoursePolicy.AllAttempts,label:'Count all attempts'},{value:RepeatCoursePolicy.LatestAttempt,label:'Use latest attempt'},{value:RepeatCoursePolicy.HighestGrade,label:'Use highest grade'}] as const;
export function appealStatusValue(v:GradeAppealStatus|number|string):GradeAppealStatus{if(typeof v==='number')return v as GradeAppealStatus;const k=String(v).toLowerCase();return (({pending:1,approved:2,rejected:3} as Record<string,number>)[k]??(Number(k)||0)) as GradeAppealStatus;}
export function appealStatusLabel(v:GradeAppealStatus|number|string):string{return ({1:'Pending',2:'Approved',3:'Rejected'} as Record<number,string>)[appealStatusValue(v)]??'Unknown';}
export function revisionStatusValue(v:GradeRevisionStatus|number|string):GradeRevisionStatus{if(typeof v==='number')return v as GradeRevisionStatus;const k=String(v).toLowerCase();return (({pendingapproval:1,approved:2,rejected:3} as Record<string,number>)[k]??Number(k)||0) as GradeRevisionStatus;}
export function revisionStatusLabel(v:GradeRevisionStatus|number|string):string{return ({1:'Pending approval',2:'Approved',3:'Rejected'} as Record<number,string>)[revisionStatusValue(v)]??'Unknown';}

export function repeatCoursePolicyValue(v:RepeatCoursePolicy|number|string):RepeatCoursePolicy{if(typeof v==='number')return v as RepeatCoursePolicy;const k=String(v).toLowerCase();return (({allattempts:1,latestattempt:2,highestgrade:3} as Record<string,number>)[k]??(Number(k)||0)) as RepeatCoursePolicy;}
export function repeatCoursePolicyLabel(v:RepeatCoursePolicy|number|string):string{return REPEAT_COURSE_POLICIES.find(x=>x.value===repeatCoursePolicyValue(v))?.label??'Unknown';}
