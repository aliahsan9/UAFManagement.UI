export enum StudentStatus { Active=1, Suspended=2, Graduated=3, Withdrawn=4 }

export interface Student {
 id:string; registrationNumber:string; fullName:string; email:string; phoneNumber:string|null;
 academicProgramId:string; enrollmentDate:string; status:StudentStatus; createdAtUtc:string; updatedAtUtc:string|null;
 statusHistory?:StudentStatusHistory[]|null;
}
export interface StudentStatusHistory { status:StudentStatus; occurredAtUtc:string; remarks?:string|null; changedByUserId?:string|null; }
export interface StudentPage { items:Student[]; page:number; pageSize:number; totalCount:number; totalPages:number; }
export interface StudentQuery { page:number; pageSize:number; academicProgramId?:string; status?:StudentStatus; search?:string; sortBy?:'registrationNumber'|'fullName'|'enrollmentDate'; sortDirection?:'asc'|'desc'; }
export interface CreateStudentRequest { registrationNumber:string; fullName:string; email:string; academicProgramId:string; enrollmentDate:string; phoneNumber:string|null; }
export interface UpdateStudentProfileRequest { fullName:string; email:string; phoneNumber:string|null; }
export interface ChangeStudentProgramRequest { academicProgramId:string; }

export interface CourseOffering { id:string; courseId:string; academicSessionId:string; section:string; capacity:number; status:number; enrolledCount:number; }
export interface CourseEnrollment { id:string; studentId:string; courseOfferingId:string; enrolledOn:string; status:number; }
export interface StudentAttendanceRow { studentId:string; registrationNumber:string; fullName:string; enrollmentStatus:number; presentCount:number; absentCount:number; lateCount:number; excusedCount:number; countedSessions:number; attendancePercentage:number|null; isBelowRequiredPercentage:boolean; }
export interface CourseAttendanceReport { courseOfferingId:string; academicSessionId:string; finalizedSessionCount:number; requiredPercentage:number; studentCount:number; students:StudentAttendanceRow[]; }
export interface ExaminationListItem { id:string; title:string; type:number; scheduledDate:string; maximumMarks:number; passingMarks:number; weightPercentage:number; status:number; }
export interface ExaminationResult { studentId:string; registrationNumber:string; fullName:string; marksObtained:number; isAbsent:boolean; isPassed:boolean; remarks:string; }
export interface StudentFeeAccount { studentId:string; totalOutstanding:number; challans:FeeChallan[]; payments:FeePayment[]; }
export interface FeeChallan { id:string; challanNumber:string; issueDate:string; dueDate:string; subtotal:number; lateFeeAmount:number; totalAmount:number; currencyCode:string; status:string; }
export interface FeePayment { id:string; challanId:string; amount:number; method:string; referenceNumber:string; status:string; verifiedAtUtc:string|null; verificationRemarks:string|null; }

export const STUDENT_STATUSES=[{value:StudentStatus.Active,label:'Active'},{value:StudentStatus.Suspended,label:'Suspended'},{value:StudentStatus.Graduated,label:'Graduated'},{value:StudentStatus.Withdrawn,label:'Withdrawn'}] as const;
export function studentStatusLabel(status:number):string{return STUDENT_STATUSES.find(x=>x.value===status)?.label??'Unknown';}
