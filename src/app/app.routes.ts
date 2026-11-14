import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
const academicPermissions=['academic-structure.manage'];
const catalogPermissions=['academic-catalog.manage'];
const admissionsStaffPermissions=['Admissions.Staff'];
const admissionsDecisionPermissions=['Admissions.Staff','Admissions.Decision'];
const studentPermissions=['students.manage'];
const offeringPermissions=['course-offerings.manage'];
const employeePermissions=['employees.manage'];
const timetablePermissions=['timetable.manage'];
const attendancePermissions=['attendance.manage'];
const examinationPermissions=['examinations.manage'];
const examinationApprovalPermissions=['examinations.manage','examinations.approve'];
const gradingScalePermissions=['grading-scales.manage'];
const courseGradePermissions=['course-grades.manage'];
const gradeAppealPermissions=['grade-appeals.review'];
const gradeRevisionRequestPermissions=['grade-revisions.manage'];
const gradeRevisionApprovalPermissions=['grade-revisions.manage','grade-revisions.approve'];
export const routes:Routes=[
 {path:'auth',loadComponent:()=>import('./features/auth/auth-layout/auth-layout').then(m=>m.AuthLayout),children:[{path:'login',loadComponent:()=>import('./features/auth/login/login').then(m=>m.Login)},{path:'register',loadComponent:()=>import('./features/auth/register/register').then(m=>m.Register)},{path:'',pathMatch:'full',redirectTo:'login'}]},
 {path:'applicant/login',loadComponent:()=>import('./features/admissions/applicant-auth-page').then(m=>m.ApplicantAuthPage),data:{mode:'login'}},
 {path:'applicant/register',loadComponent:()=>import('./features/admissions/applicant-auth-page').then(m=>m.ApplicantAuthPage),data:{mode:'register'}},
 {path:'applicant',canActivate:[authGuard],loadComponent:()=>import('./layouts/applicant-layout/applicant-layout').then(m=>m.ApplicantLayout),children:[
  {path:'dashboard',loadComponent:()=>import('./features/admissions/applicant-dashboard').then(m=>m.ApplicantDashboard)},
  {path:'applications',loadComponent:()=>import('./features/admissions/applicant-applications-page').then(m=>m.ApplicantApplicationsPage)},
  {path:'applications/new',loadComponent:()=>import('./features/admissions/applicant-application-form').then(m=>m.ApplicantApplicationForm)},
  {path:'applications/:id/edit',loadComponent:()=>import('./features/admissions/applicant-application-form').then(m=>m.ApplicantApplicationForm)},
  {path:'applications/:id/documents',loadComponent:()=>import('./features/admissions/applicant-application-details').then(m=>m.ApplicantApplicationDetails)},
  {path:'applications/:id/timeline',loadComponent:()=>import('./features/admissions/applicant-application-details').then(m=>m.ApplicantApplicationDetails)},
  {path:'applications/:id/readiness',loadComponent:()=>import('./features/admissions/applicant-application-details').then(m=>m.ApplicantApplicationDetails)},
  {path:'applications/:id',loadComponent:()=>import('./features/admissions/applicant-application-details').then(m=>m.ApplicantApplicationDetails)},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}]},
 {path:'',canActivate:[authGuard],canActivateChild:[roleGuard],loadComponent:()=>import('./layouts/admin-layout/admin-layout').then(m=>m.AdminLayout),children:[
  {path:'dashboard',loadComponent:()=>import('./features/dashboard/dashboard').then(m=>m.Dashboard)},
  {path:'academic-structure/universities',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'universities',permissions:academicPermissions}},
  {path:'academic-structure/campuses',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'campuses',permissions:academicPermissions}},
  {path:'academic-structure/faculties',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'faculties',permissions:academicPermissions}},
  {path:'academic-structure/departments',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'departments',permissions:academicPermissions}},
  {path:'academic-structure/programs',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'programs',permissions:academicPermissions}},
  {path:'academic-sessions',loadComponent:()=>import('./features/academic-catalog/academic-sessions-page').then(m=>m.AcademicSessionsPage),data:{permissions:catalogPermissions}},
  {path:'courses',loadComponent:()=>import('./features/academic-catalog/courses-page').then(m=>m.CoursesPage),data:{permissions:catalogPermissions}},
  {path:'course-offerings',loadComponent:()=>import('./features/course-offerings/course-offerings-page').then(m=>m.CourseOfferingsPage),data:{permissions:offeringPermissions}},
  {path:'course-offerings/:id',loadComponent:()=>import('./features/course-offerings/course-offering-details-page').then(m=>m.CourseOfferingDetailsPage),data:{permissions:offeringPermissions}},
  {path:'students',loadComponent:()=>import('./features/students/students-directory-page').then(m=>m.StudentsDirectoryPage),data:{permissions:studentPermissions}},
  {path:'students/new',loadComponent:()=>import('./features/students/student-form-page').then(m=>m.StudentFormPage),data:{permissions:studentPermissions}},
  {path:'students/:id/edit',loadComponent:()=>import('./features/students/student-form-page').then(m=>m.StudentFormPage),data:{permissions:studentPermissions}},
  {path:'students/:id',loadComponent:()=>import('./features/students/student-details-page').then(m=>m.StudentDetailsPage),data:{permissions:studentPermissions}},
  {path:'attendance',loadComponent:()=>import('./features/attendance/attendance-page').then(m=>m.AttendancePage),data:{permissions:attendancePermissions}},
  {path:'grading/scales',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'scales',permissions:gradingScalePermissions}},
  {path:'grading/finalization',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'finalization',permissions:courseGradePermissions}},
  {path:'grading/appeals',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'appeals',permissions:gradeAppealPermissions}},
  {path:'grading/revisions/approvals',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'revisionApprovals',permissions:gradeRevisionApprovalPermissions}},
  {path:'grading/revisions',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'revisions',permissions:gradeRevisionRequestPermissions}},
  {path:'my-academic-record',loadComponent:()=>import('./features/grading/my-academic-record-page').then(m=>m.MyAcademicRecordPage),data:{roles:['Student']}},
  {path:'examinations/:id/results',loadComponent:()=>import('./features/examinations/examination-results-page').then(m=>m.ExaminationResultsPage),data:{permissions:examinationPermissions}},
  {path:'examinations/approvals',loadComponent:()=>import('./features/examinations/examinations-page').then(m=>m.ExaminationsPage),data:{mode:'approval',permissions:examinationApprovalPermissions}},
  {path:'examinations',loadComponent:()=>import('./features/examinations/examinations-page').then(m=>m.ExaminationsPage),data:{permissions:examinationPermissions}},
  {path:'timetable',loadComponent:()=>import('./features/timetable/timetable-page').then(m=>m.TimetablePage),data:{permissions:timetablePermissions}},
  {path:'employees',loadComponent:()=>import('./features/employees/employees-directory-page').then(m=>m.EmployeesDirectoryPage),data:{permissions:employeePermissions}},
  {path:'employees/new',loadComponent:()=>import('./features/employees/employee-form-page').then(m=>m.EmployeeFormPage),data:{permissions:employeePermissions}},
  {path:'employees/:id/edit',loadComponent:()=>import('./features/employees/employee-form-page').then(m=>m.EmployeeFormPage),data:{permissions:employeePermissions}},
  {path:'employees/:id',loadComponent:()=>import('./features/employees/employee-details-page').then(m=>m.EmployeeDetailsPage),data:{permissions:employeePermissions}},
  {path:'admissions/staff',loadComponent:()=>import('./features/admissions/admissions-staff-dashboard').then(m=>m.AdmissionsStaffDashboard),data:{permissions:admissionsStaffPermissions}},
  {path:'admissions/staff/applications',loadComponent:()=>import('./features/admissions/admissions-staff-queue').then(m=>m.AdmissionsStaffQueue),data:{permissions:admissionsStaffPermissions}},
  {path:'admissions/staff/applications/new',loadComponent:()=>import('./features/admissions/admissions-staff-draft').then(m=>m.AdmissionsStaffDraft),data:{permissions:admissionsStaffPermissions}},
  {path:'admissions/staff/applications/:id',loadComponent:()=>import('./features/admissions/admissions-staff-detail').then(m=>m.AdmissionsStaffDetail),data:{permissions:admissionsStaffPermissions}},
  {path:'admissions/staff/registration-series',loadComponent:()=>import('./features/admissions/registration-series-page').then(m=>m.RegistrationSeriesPage),data:{permissions:admissionsDecisionPermissions}},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}]},
 {path:'forbidden',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage),data:{code:'403',title:'Access restricted',message:'You do not have permission to view this page.'}},
 {path:'not-found',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage)},
 {path:'**',redirectTo:'not-found'}
];