import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AcademicProgram, AcademicProgramRequest, Campus, CampusRequest, Department, DepartmentRequest, Faculty, FacultyRequest, University, UniversityRequest } from './academic-structure.models';

@Injectable({ providedIn: 'root' })
export class AcademicStructureService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl + '/api/v1/academic-structure';

  getUniversities(): Observable<University[]> { return this.http.get<University[]>(this.base + '/universities'); }
  createUniversity(request: UniversityRequest): Observable<{ id: string }> { return this.http.post<{ id: string }>(this.base + '/universities', request); }
  updateUniversity(id: string, request: UniversityRequest): Observable<void> { return this.http.put<void>(this.base + '/universities/' + id, request); }

  getCampuses(universityId?: string): Observable<Campus[]> { return this.http.get<Campus[]>(this.base + '/campuses', { params: this.parentParams('universityId', universityId) }); }
  createCampus(request: CampusRequest): Observable<{ id: string }> { return this.http.post<{ id: string }>(this.base + '/campuses', request); }
  updateCampus(id: string, request: Omit<CampusRequest, 'universityId'>): Observable<void> { return this.http.put<void>(this.base + '/campuses/' + id, request); }
  deactivateCampus(id: string): Observable<void> { return this.http.delete<void>(this.base + '/campuses/' + id); }

  getFaculties(universityId?: string): Observable<Faculty[]> { return this.http.get<Faculty[]>(this.base + '/faculties', { params: this.parentParams('universityId', universityId) }); }
  createFaculty(request: FacultyRequest): Observable<{ id: string }> { return this.http.post<{ id: string }>(this.base + '/faculties', request); }
  updateFaculty(id: string, request: Omit<FacultyRequest, 'universityId'>): Observable<void> { return this.http.put<void>(this.base + '/faculties/' + id, request); }
  deactivateFaculty(id: string): Observable<void> { return this.http.delete<void>(this.base + '/faculties/' + id); }

  getDepartments(facultyId?: string): Observable<Department[]> { return this.http.get<Department[]>(this.base + '/departments', { params: this.parentParams('facultyId', facultyId) }); }
  createDepartment(request: DepartmentRequest): Observable<{ id: string }> { return this.http.post<{ id: string }>(this.base + '/departments', request); }
  updateDepartment(id: string, request: Omit<DepartmentRequest, 'facultyId'>): Observable<void> { return this.http.put<void>(this.base + '/departments/' + id, request); }
  deactivateDepartment(id: string): Observable<void> { return this.http.delete<void>(this.base + '/departments/' + id); }

  getPrograms(departmentId?: string): Observable<AcademicProgram[]> { return this.http.get<AcademicProgram[]>(this.base + '/programs', { params: this.parentParams('departmentId', departmentId) }); }
  createProgram(request: AcademicProgramRequest): Observable<{ id: string }> { return this.http.post<{ id: string }>(this.base + '/programs', request); }
  updateProgram(id: string, request: Omit<AcademicProgramRequest, 'departmentId'>): Observable<void> { return this.http.put<void>(this.base + '/programs/' + id, request); }
  deactivateProgram(id: string): Observable<void> { return this.http.delete<void>(this.base + '/programs/' + id); }

  private parentParams(key: string, value?: string): HttpParams {
    return value ? new HttpParams().set(key, value) : new HttpParams();
  }
}