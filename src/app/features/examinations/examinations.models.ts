export enum ExaminationType { Quiz=1, Assignment=2, Midterm=3, Final=4, Practical=5, Project=6 }
export enum ExaminationStatus { Draft=1, Scheduled=2, MarksEntryOpen=3, Submitted=4, Approved=5, Published=6, Cancelled=7 }

export interface CreateExaminationRequest {
 courseOfferingId:string; title:string; type:ExaminationType; scheduledDate:string;
 maximumMarks:number; passingMarks:number; weightPercentage:number;
}
export interface ExaminationMarkItem {
 studentId:string; marksObtained:number; isAbsent:boolean; remarks:string|null; reason:string;
}
export interface SaveExaminationMarksRequest { marks:ExaminationMarkItem[]; }
export interface Examination {
 id:string; courseOfferingId:string; title:string; type:ExaminationType|number|string;
 scheduledDate:string; maximumMarks:number; passingMarks:number; weightPercentage:number;
 status:ExaminationStatus|number|string; submittedByUserId:string|null; submittedAtUtc:string|null;
 approvedByUserId:string|null; approvedAtUtc:string|null; publishedByUserId:string|null; publishedAtUtc:string|null;
}
export interface ExaminationListItem {
 id:string; title:string; type:ExaminationType|number|string; scheduledDate:string;
 maximumMarks:number; passingMarks:number; weightPercentage:number; status:ExaminationStatus|number|string;
}
export interface ExaminationResult {
 studentId:string; registrationNumber:string; fullName:string; marksObtained:number;
 isAbsent:boolean; isPassed:boolean; remarks:string;
}
export const EXAMINATION_TYPES=[
 {value:ExaminationType.Quiz,label:'Quiz'},{value:ExaminationType.Assignment,label:'Assignment'},
 {value:ExaminationType.Midterm,label:'Midterm'},{value:ExaminationType.Final,label:'Final'},
 {value:ExaminationType.Practical,label:'Practical'},{value:ExaminationType.Project,label:'Project'}
] as const;
export function examinationTypeValue(value:ExaminationType|number|string):ExaminationType {
 if(typeof value==='number')return value as ExaminationType;
 const key=String(value).toLowerCase();
 return (({quiz:1,assignment:2,midterm:3,final:4,practical:5,project:6} as Record<string,number>)[key]??(Number(key)||0)) as ExaminationType;
}
export function examinationTypeLabel(value:ExaminationType|number|string):string {
 return EXAMINATION_TYPES.find(x=>x.value===examinationTypeValue(value))?.label??'Unknown';
}
export function examinationStatusValue(value:ExaminationStatus|number|string):ExaminationStatus {
 if(typeof value==='number')return value as ExaminationStatus;
 const key=String(value).toLowerCase();
 return (({draft:1,scheduled:2,marksentryopen:3,submitted:4,approved:5,published:6,cancelled:7} as Record<string,number>)[key]??(Number(key)||0)) as ExaminationStatus;
}
export function examinationStatusLabel(value:ExaminationStatus|number|string):string {
 return ({1:'Draft',2:'Scheduled',3:'Marks entry open',4:'Submitted',5:'Approved',6:'Published',7:'Cancelled'} as Record<number,string>)[examinationStatusValue(value)]??'Unknown';
}
