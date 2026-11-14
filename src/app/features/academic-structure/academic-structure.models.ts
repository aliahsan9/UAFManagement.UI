import type {DataTableColumn} from '../../shared/models/ui.models';

export type AcademicEntityKind = 'universities' | 'campuses' | 'faculties' | 'departments' | 'programs';
export interface University { [key: string]: unknown; id: string; name: string; shortName: string; }
export interface Campus { [key: string]: unknown; id: string; universityId: string; name: string; code: string; address: string | null; isActive: boolean; }
export interface Faculty { [key: string]: unknown; id: string; universityId: string; name: string; code: string; isActive: boolean; }
export interface Department { [key: string]: unknown; id: string; facultyId: string; name: string; code: string; isActive: boolean; }
export type DegreeLevel = 1 | 2 | 3 | 4;
export interface AcademicProgram { [key: string]: unknown; id: string; departmentId: string; name: string; code: string; degreeLevel: DegreeLevel | number; durationInYears: number; isActive: boolean; }
export type AcademicRecord = University | Campus | Faculty | Department | AcademicProgram;
export interface UniversityRequest { name: string; shortName: string; }
export interface CampusRequest { universityId: string; name: string; code: string; address: string | null; }
export interface FacultyRequest { universityId: string; name: string; code: string; }
export interface DepartmentRequest { facultyId: string; name: string; code: string; }
export interface AcademicProgramRequest { departmentId: string; name: string; code: string; degreeLevel: DegreeLevel; durationInYears: number; }
export type TableColumn = DataTableColumn;
export const DEGREE_LEVELS = [{label:'Undergraduate',value:1},{label:'Graduate',value:2},{label:'MPhil',value:3},{label:'Doctoral',value:4}] as const;
