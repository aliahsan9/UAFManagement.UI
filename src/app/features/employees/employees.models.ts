export enum EmployeeCategory { Academic=1, Administrative=2, Technical=3, Support=4 }
export enum EmployeeStatus { Active=1, OnLeave=2, Suspended=3, Terminated=4 }
export interface Employee { id:string; employeeNumber:string; fullName:string; email:string; designation:string; phoneNumber:string|null; departmentId:string; category:EmployeeCategory|number; joiningDate:string; status:EmployeeStatus|number; identityUserId:string|null; terminationDate:string|null; createdAtUtc:string; updatedAtUtc:string|null; }
export interface EmployeePage { items:Employee[]; page:number; pageSize:number; totalCount:number; totalPages:number; }
export interface EmployeeQuery { page:number; pageSize:number; departmentId?:string; status?:EmployeeStatus; category?:EmployeeCategory; }
export interface CreateEmployeeRequest { employeeNumber:string; fullName:string; email:string; designation:string; departmentId:string; category:EmployeeCategory; joiningDate:string; phoneNumber:string|null; identityUserId:string|null; }
export interface UpdateEmployeeProfileRequest { fullName:string; email:string; designation:string; phoneNumber:string|null; }
export interface TeacherProfile { id:string; employeeId:string; highestQualification:string; specialization:string; academicRank:string; }
export interface TeacherProfileRequest { highestQualification:string; specialization:string; academicRank:string; }
export const EMPLOYEE_CATEGORIES=[{value:EmployeeCategory.Academic,label:'Academic'},{value:EmployeeCategory.Administrative,label:'Administrative'},{value:EmployeeCategory.Technical,label:'Technical'},{value:EmployeeCategory.Support,label:'Support'}] as const;
export const EMPLOYEE_STATUSES=[{value:EmployeeStatus.Active,label:'Active'},{value:EmployeeStatus.OnLeave,label:'On leave'},{value:EmployeeStatus.Suspended,label:'Suspended'},{value:EmployeeStatus.Terminated,label:'Terminated'}] as const;
export const employeeCategoryLabel=(v:number)=>EMPLOYEE_CATEGORIES.find(x=>x.value===v)?.label??'Unknown';
export const employeeStatusLabel=(v:number)=>EMPLOYEE_STATUSES.find(x=>x.value===v)?.label??'Unknown';
