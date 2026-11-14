export enum AdmissionStatus { Draft=1, Submitted=2, UnderReview=3, Accepted=4, Rejected=5, Waitlisted=6, Withdrawn=7 }
export enum AdmissionDocumentType { IdentityDocument=1, AcademicTranscript=2, Photograph=3, Other=4 }
export enum AdmissionDocumentStatus { Pending=1, Verified=2, Rejected=3 }

export interface AdmissionApplication {
  id:string; applicationNumber:string; applicantFullName:string; applicantEmail:string; phoneNumber:string|null;
  academicProgramId:string; applicationDate:string; status:AdmissionStatus; decisionRemarks:string|null;
  createdAtUtc:string; updatedAtUtc:string|null;
}
export interface StaffAdmissionApplication extends AdmissionApplication {
  ownerUserId:string|null; reviewStartedByUserId:string|null; reviewStartedAtUtc:string|null;
  decisionByUserId:string|null; decisionAtUtc:string|null;
}
export interface StaffApplicationPage { items:StaffAdmissionApplication[]; page:number; pageSize:number; totalCount:number; totalPages:number; }
export interface CreateApplicantDraft { applicantFullName:string; applicantEmail:string; academicProgramId:string; phoneNumber:string|null; }
export interface UpdateApplicantDraft { applicantFullName:string; applicantEmail:string; phoneNumber:string|null; }
export interface SubmissionReadiness {
  applicationId:string; requirementsConfigured:boolean; canSubmit:boolean;
  requiredDocumentTypes:AdmissionDocumentType[]; missingVerifiedDocumentTypes:AdmissionDocumentType[];
}
export interface AdmissionDocument {
  id:string; applicationId:string; documentType:AdmissionDocumentType; originalFileName:string;
  contentType:string; sizeBytes:number; status:AdmissionDocumentStatus; createdAtUtc:string;
  verifiedByUserId:string|null; verifiedAtUtc:string|null; verificationRemarks:string|null;
}
export interface AdmissionDecisionAudit {
  id:string; applicationId:string; actorUserId:string; fromStatus:AdmissionStatus;
  toStatus:AdmissionStatus; remarks:string|null; occurredAtUtc:string;
}
export interface ConfigureRegistrationSeries {
  academicProgramId:string; admissionYear:number; prefix:string; nextNumber:number;
}
export interface ConvertedStudent {
  studentId:string; admissionApplicationId:string; registrationNumber:string; fullName:string;
  email:string; academicProgramId:string; enrollmentDate:string;
}
export const ADMISSION_STATUSES: {value:AdmissionStatus;label:string}[] = [
 {value:AdmissionStatus.Draft,label:'Draft'},{value:AdmissionStatus.Submitted,label:'Submitted'},
 {value:AdmissionStatus.UnderReview,label:'Under review'},{value:AdmissionStatus.Accepted,label:'Accepted'},
 {value:AdmissionStatus.Rejected,label:'Rejected'},{value:AdmissionStatus.Waitlisted,label:'Waitlisted'},
 {value:AdmissionStatus.Withdrawn,label:'Withdrawn'}
];
export const DOCUMENT_TYPES: {value:AdmissionDocumentType;label:string}[] = [
 {value:AdmissionDocumentType.IdentityDocument,label:'Identity document'},
 {value:AdmissionDocumentType.AcademicTranscript,label:'Academic transcript'},
 {value:AdmissionDocumentType.Photograph,label:'Photograph'},
 {value:AdmissionDocumentType.Other,label:'Other'}
];
export function admissionStatusLabel(status:AdmissionStatus):string {
 return ADMISSION_STATUSES.find(x=>x.value===status)?.label??'Unknown';
}
export function documentTypeLabel(type:AdmissionDocumentType):string {
 return DOCUMENT_TYPES.find(x=>x.value===type)?.label??'Other';
}

export interface ApplicantAcademicProgram { id:string; name:string; code:string; degreeLevel:number; durationInYears:number; }
