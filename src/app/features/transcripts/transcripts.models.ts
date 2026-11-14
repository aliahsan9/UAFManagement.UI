export interface TranscriptIssued { id:string; verificationCode:string; snapshotSha256:string; registrationNumber:string; issuedAtUtc:string; }
export interface TranscriptListItem { id:string; verificationCode:string; snapshotSha256:string; issuedAtUtc:string; }
export interface TranscriptVerification { isAuthentic:boolean; registrationNumber:string|null; issuedAtUtc:string|null; snapshotSha256:string|null; }
