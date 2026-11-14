export enum AttendanceStatus { Present=1, Absent=2, Late=3, Excused=4 }
export enum AttendanceSessionStatus { Open=1, Finalized=2, Cancelled=3 }
export interface CreateAttendanceSessionRequest { courseOfferingId:string; attendanceDate:string; topic:string|null; }
export interface AttendanceMarkItem { studentId:string; status:AttendanceStatus; reason:string|null; }
export interface MarkAttendanceRequest { marks:AttendanceMarkItem[]; }
export interface AttendanceMarkResponse { studentId:string; status:AttendanceStatus|number|string; remarks:string; markedByUserId:string; markedAtUtc:string; }
export interface AttendanceSession { id:string; courseOfferingId:string; attendanceDate:string; topic:string; status:AttendanceSessionStatus|number|string; createdByUserId:string; finalizedByUserId:string|null; finalizedAtUtc:string|null; marks:AttendanceMarkResponse[]; }
export interface ConfigureAttendancePolicyRequest { requiredPercentage:number; lateCreditPercentage:number; excludeExcusedFromDenominator:boolean; }
export interface AttendancePolicy { academicSessionId:string; requiredPercentage:number; lateCreditPercentage:number; excludeExcusedFromDenominator:boolean; configuredByUserId:string; configuredAtUtc:string; }
export interface StudentAttendanceReport { studentId:string; registrationNumber:string; fullName:string; enrollmentStatus:number|string; presentCount:number; absentCount:number; lateCount:number; excusedCount:number; countedSessions:number; attendancePercentage:number|null; isBelowRequiredPercentage:boolean; }
export interface CourseAttendanceReport { courseOfferingId:string; academicSessionId:string; finalizedSessionCount:number; requiredPercentage:number; lateCreditPercentage:number; excludeExcusedFromDenominator:boolean; studentCount:number; studentsBelowThreshold:number; averageAttendancePercentage:number|null; students:StudentAttendanceReport[]; }
export const ATTENDANCE_STATUS_OPTIONS=[{value:AttendanceStatus.Present,label:'Present'},{value:AttendanceStatus.Absent,label:'Absent'},{value:AttendanceStatus.Late,label:'Late'},{value:AttendanceStatus.Excused,label:'Excused'}] as const;
export function attendanceStatusValue(v:AttendanceStatus|number|string):AttendanceStatus{if(typeof v==='number')return v as AttendanceStatus;const s=String(v).toLowerCase();return (({present:1,absent:2,late:3,excused:4} as Record<string,number>)[s]??(Number(s)||0)) as AttendanceStatus;}
export function attendanceStatusLabel(v:AttendanceStatus|number|string):string{return ({1:'Present',2:'Absent',3:'Late',4:'Excused'} as Record<number,string>)[attendanceStatusValue(v)]??'Unknown';}
export function attendanceSessionStatusValue(v:AttendanceSessionStatus|number|string):AttendanceSessionStatus{if(typeof v==='number')return v as AttendanceSessionStatus;const s=String(v).toLowerCase();return (({open:1,finalized:2,cancelled:3} as Record<string,number>)[s]??Number(s)||0) as AttendanceSessionStatus;}
export function attendanceSessionStatusLabel(v:AttendanceSessionStatus|number|string):string{return ({1:'Open',2:'Finalized',3:'Cancelled'} as Record<number,string>)[attendanceSessionStatusValue(v)]??'Unknown';}
