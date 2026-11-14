export enum CourseOfferingStatus { Draft=1, Published=2, Closed=3, Cancelled=4 }
export enum EnrollmentStatus { Enrolled=1, Dropped=2, Completed=3, Withdrawn=4 }
export enum TimetableEntryStatus { Draft=1, Published=2, Cancelled=3 }

export interface CourseOffering {
 id:string; courseId:string; academicSessionId:string; section:string; capacity:number;
 instructorEmployeeId:string|null; status:CourseOfferingStatus|number|string; enrolledCount:number;
}
export interface CreateCourseOfferingRequest { courseId:string; academicSessionId:string; section:string; capacity:number; instructorEmployeeId:string|null; }
export interface UpdateCourseOfferingRequest { capacity:number; instructorEmployeeId:string|null; }
export interface CourseEnrollment { id:string; studentId:string; courseOfferingId:string; enrolledOn:string; status:EnrollmentStatus|number|string; }
export interface EnrollStudentRequest { enrolledOn:string; }
export interface TimetableEntry {
 id:string; courseOfferingId:string; roomId:string; dayOfWeek:number|string; startTime:string; endTime:string;
 effectiveFrom:string; effectiveTo:string; status:TimetableEntryStatus|number|string;
}
export interface TeachingRoom { id:string; campusId:string; code:string; name:string; capacity:number; roomType:string; isActive:boolean; }

export const OFFERING_STATUS_OPTIONS=[
 {value:'',label:'All statuses'},
 {value:CourseOfferingStatus.Draft,label:'Draft'},
 {value:CourseOfferingStatus.Published,label:'Published'},
 {value:CourseOfferingStatus.Closed,label:'Closed'},
 {value:CourseOfferingStatus.Cancelled,label:'Cancelled'}
] as const;
export const ENROLLMENT_STATUS_OPTIONS=[
 {value:EnrollmentStatus.Enrolled,label:'Enrolled'},
 {value:EnrollmentStatus.Dropped,label:'Dropped'},
 {value:EnrollmentStatus.Completed,label:'Completed'},
 {value:EnrollmentStatus.Withdrawn,label:'Withdrawn'}
] as const;
export function offeringStatusValue(value:CourseOffering['status']):CourseOfferingStatus {
 if(typeof value==='number')return value as CourseOfferingStatus;
 const v=String(value).toLowerCase();
 return ({draft:1,published:2,closed:3,cancelled:4}[v]??(Number(v)||1)) as CourseOfferingStatus;
}
export function offeringStatusLabel(value:CourseOffering['status']):string {
 return ({1:'Draft',2:'Published',3:'Closed',4:'Cancelled'} as Record<number,string>)[offeringStatusValue(value)]??'Unknown';
}
export function offeringStatusClass(value:CourseOffering['status']):string {
 return ({1:'text-bg-secondary',2:'text-bg-success',3:'text-bg-primary',4:'text-bg-danger'} as Record<number,string>)[offeringStatusValue(value)]??'text-bg-light';
}
export function enrollmentStatusValue(value:CourseEnrollment['status']):EnrollmentStatus {
 if(typeof value==='number')return value as EnrollmentStatus;
 const v=String(value).toLowerCase();
 return ({enrolled:1,dropped:2,completed:3,withdrawn:4}[v]??(Number(v)||0)) as EnrollmentStatus;
}
export function enrollmentStatusLabel(value:CourseEnrollment['status']):string {
 return ({1:'Enrolled',2:'Dropped',3:'Completed',4:'Withdrawn'} as Record<number,string>)[enrollmentStatusValue(value)]??'Unknown';
}
export function timetableStatusLabel(value:TimetableEntryStatus|number|string):string {
 const v=typeof value==='number'?value:Number(value);
 return ({1:'Draft',2:'Published',3:'Cancelled'} as Record<number,string>)[v]??String(value);
}
