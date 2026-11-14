import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const academicPolicies=['AcademicStructure.Admin'];
const catalogPolicies=['AcademicCatalog.Management'];
const admissionsStaffPolicies=['Admissions.Staff'];
const admissionsDecisionPolicies=['Admissions.Staff','Admissions.Decision'];
const studentPolicies=['Students.Management'];
const offeringPolicies=['CourseOfferings.Management'];
const employeePolicies=['Employees.Management'];
const timetablePolicies=['Timetable.Management'];
const attendancePolicies=['Attendance.Management'];
const attendancePolicyPolicies=['Attendance.PolicyManagement','AcademicCatalog.Management','CourseOfferings.Management'];
const examinationPolicies=['Examinations.Management'];
const examinationApprovalPolicies=['Examinations.Management','Examinations.Approval'];
const gradingScalePolicies=['Grading.ScaleManagement','AcademicCatalog.Management'];
const courseGradePolicies=['Grading.CourseGradeManagement','CourseOfferings.Management'];
const gradeAppealPolicies=['Grading.GradeAppealReview'];
const gradeRevisionRequestPolicies=['Grading.GradeRevisionRequestManagement'];
const gradeRevisionApprovalPolicies=['Grading.GradeRevisionRequestManagement','Grading.GradeRevisionApproval'];
const financePolicies=['Finance.Management','Analytics.Read'];

export const routes:Routes=[
 {path:'auth',loadComponent:()=>import('./features/auth/auth-layout/auth-layout').then(m=>m.AuthLayout),children:[{path:'login',loadComponent:()=>import('./features/auth/login/login').then(m=>m.Login)},{path:'register',loadComponent:()=>import('./features/auth/register/register').then(m=>m.Register)},{path:'',pathMatch:'full',redirectTo:'login'}]},
 {path:'applicant/login',loadComponent:()=>import('./features/admissions/applicant-auth-page').then(m=>m.ApplicantAuthPage),data:{mode:'login'}},
 {path:'applicant/register',loadComponent:()=>import('./features/admissions/applicant-auth-page').then(m=>m.ApplicantAuthPage),data:{mode:'register'}},

 // Applicant self-service is a Student-role policy in the backend.
 {path:'applicant',canActivate:[authGuard,roleGuard],canActivateChild:[roleGuard],data:{policies:['Admissions.Applicant']},loadComponent:()=>import('./layouts/applicant-layout/applicant-layout').then(m=>m.ApplicantLayout),children:[
  {path:'dashboard',loadComponent:()=>import('./features/admissions/applicant-dashboard').then(m=>m.ApplicantDashboard)},
  {path:'applications',loadComponent:()=>import('./features/admissions/applicant-applications-page').then(m=>m.ApplicantApplicationsPage)},
  {path:'applications/new',loadComponent:()=>import('./features/admissions/applicant-application-form').then(m=>m.ApplicantApplicationForm)},
  {path:'applications/:id/edit',loadComponent:()=>import('./features/admissions/applicant-application-form').then(m=>m.ApplicantApplicationForm)},
  {path:'applications/:id/documents',loadComponent:()=>import('./features/admissions/applicant-application-details').then(m=>m.ApplicantApplicationDetails)},
  {path:'applications/:id/timeline',loadComponent:()=>import('./features/admissions/applicant-application-details').then(m=>m.ApplicantApplicationDetails)},
  {path:'applications/:id/readiness',loadComponent:()=>import('./features/admissions/applicant-application-details').then(m=>m.ApplicantApplicationDetails)},
  {path:'applications/:id',loadComponent:()=>import('./features/admissions/applicant-application-details').then(m=>m.ApplicantApplicationDetails)},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}]},

 // Public endpoint: deliberately outside all authenticated layouts and guards.
 {path:'transcript-verification/:verificationCode',loadComponent:()=>import('./features/transcripts/transcript-verification-page').then(m=>m.TranscriptVerificationPage)},

 // Student workspace: the academic record API is role-scoped to Student.
 {path:'student',canActivate:[authGuard,roleGuard],canActivateChild:[roleGuard],data:{roles:['Student']},loadComponent:()=>import('./layouts/student-portal-layout/student-portal-layout').then(m=>m.StudentPortalLayout),children:[
  {path:'dashboard',loadComponent:()=>import('./features/portals/portal-dashboard-page').then(m=>m.PortalDashboardPage),data:{portal:'student'}},
  {path:'academic-record',loadComponent:()=>import('./features/grading/my-academic-record-page').then(m=>m.MyAcademicRecordPage),data:{policies:['AcademicRecords.Student']}},
  {path:'transcripts',loadComponent:()=>import('./features/transcripts/my-transcripts-page').then(m=>m.MyTranscriptsPage),data:{policies:['AcademicRecords.Student']}},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}]},

 // Faculty portal: individual actions remain guarded by their corresponding backend policies.
 {path:'faculty',canActivate:[authGuard,roleGuard],canActivateChild:[roleGuard],data:{roles:['Teacher']},loadComponent:()=>import('./layouts/faculty-portal-layout/faculty-portal-layout').then(m=>m.FacultyPortalLayout),children:[
  {path:'dashboard',loadComponent:()=>import('./features/portals/portal-dashboard-page').then(m=>m.PortalDashboardPage),data:{portal:'faculty'}},
  {path:'attendance',loadComponent:()=>import('./features/attendance/attendance-page').then(m=>m.AttendancePage),data:{policies:['Attendance.Management','AcademicCatalog.Management','CourseOfferings.Management','Students.Management']}},
  {path:'examinations',loadComponent:()=>import('./features/examinations/examinations-page').then(m=>m.ExaminationsPage),data:{policies:['Examinations.Management','CourseOfferings.Management']}},
  {path:'examinations/:id/results',loadComponent:()=>import('./features/examinations/examination-results-page').then(m=>m.ExaminationResultsPage),data:{policies:['Examinations.Management','CourseOfferings.Management']}},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}]},

 // Admissions staff workspace: parent requires Admissions.Staff; decision actions require an additional policy.
 {path:'admissions/staff',canActivate:[authGuard,roleGuard],canActivateChild:[roleGuard],data:{policies:admissionsStaffPolicies},loadComponent:()=>import('./layouts/admissions-staff-layout/admissions-staff-layout').then(m=>m.AdmissionsStaffLayout),children:[
  {path:'',pathMatch:'full',loadComponent:()=>import('./features/portals/portal-dashboard-page').then(m=>m.PortalDashboardPage),data:{portal:'admissions'}},
  {path:'applications',loadComponent:()=>import('./features/admissions/admissions-staff-queue').then(m=>m.AdmissionsStaffQueue)},
  {path:'applications/new',loadComponent:()=>import('./features/admissions/admissions-staff-draft').then(m=>m.AdmissionsStaffDraft)},
  {path:'applications/:id',loadComponent:()=>import('./features/admissions/admissions-staff-detail').then(m=>m.AdmissionsStaffDetail)},
  {path:'registration-series',loadComponent:()=>import('./features/admissions/registration-series-page').then(m=>m.RegistrationSeriesPage),data:{policies:admissionsDecisionPolicies}}]},

 // Administration workspace. Individual modules still require their own policies.
 {path:'',canActivate:[authGuard,roleGuard],canActivateChild:[roleGuard],data:{roles:['SuperAdmin','DepartmentAdmin','Registrar','FinanceOfficer','HRManager']},loadComponent:()=>import('./layouts/admin-layout/admin-layout').then(m=>m.AdminLayout),children:[
  {path:'dashboard',loadComponent:()=>import('./features/portals/portal-dashboard-page').then(m=>m.PortalDashboardPage),data:{portal:'administration'}},
  {path:'academic-structure/universities',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'universities',policies:academicPolicies}},
  {path:'academic-structure/campuses',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'campuses',policies:academicPolicies}},
  {path:'academic-structure/faculties',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'faculties',policies:academicPolicies}},
  {path:'academic-structure/departments',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'departments',policies:academicPolicies}},
  {path:'academic-structure/programs',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'programs',policies:academicPolicies}},
  {path:'academic-sessions',loadComponent:()=>import('./features/academic-catalog/academic-sessions-page').then(m=>m.AcademicSessionsPage),data:{policies:catalogPolicies}},
  {path:'courses',loadComponent:()=>import('./features/academic-catalog/courses-page').then(m=>m.CoursesPage),data:{policies:catalogPolicies}},
  {path:'course-offerings',loadComponent:()=>import('./features/course-offerings/course-offerings-page').then(m=>m.CourseOfferingsPage),data:{policies:offeringPolicies}},
  {path:'course-offerings/:id',loadComponent:()=>import('./features/course-offerings/course-offering-details-page').then(m=>m.CourseOfferingDetailsPage),data:{policies:offeringPolicies}},
  {path:'students',loadComponent:()=>import('./features/students/students-directory-page').then(m=>m.StudentsDirectoryPage),data:{policies:studentPolicies}},
  {path:'students/new',loadComponent:()=>import('./features/students/student-form-page').then(m=>m.StudentFormPage),data:{policies:studentPolicies}},
  {path:'students/:id/edit',loadComponent:()=>import('./features/students/student-form-page').then(m=>m.StudentFormPage),data:{policies:studentPolicies}},
  {path:'students/:id',loadComponent:()=>import('./features/students/student-details-page').then(m=>m.StudentDetailsPage),data:{policies:studentPolicies}},
  {path:'attendance',loadComponent:()=>import('./features/attendance/attendance-page').then(m=>m.AttendancePage),data:{policies:attendancePolicies}},
  {path:'attendance/policies',loadComponent:()=>import('./features/attendance/attendance-page').then(m=>m.AttendancePage),data:{policies:attendancePolicyPolicies}},
  {path:'finance',loadComponent:()=>import('./features/finance/finance-page').then(m=>m.FinancePage),data:{policies:financePolicies}},
  {path:'grading/scales',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'scales',policies:gradingScalePolicies}},
  {path:'grading/finalization',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'finalization',policies:courseGradePolicies}},
  {path:'grading/appeals',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'appeals',policies:gradeAppealPolicies}},
  {path:'grading/revisions/approvals',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'revisionApprovals',policies:gradeRevisionApprovalPolicies}},
  {path:'grading/revisions',loadComponent:()=>import('./features/grading/grading-management-page').then(m=>m.GradingManagementPage),data:{mode:'revisions',policies:gradeRevisionRequestPolicies}},
  {path:'transcripts/issue',loadComponent:()=>import('./features/transcripts/transcript-issuance-page').then(m=>m.TranscriptIssuancePage),data:{policies:['Transcripts.Issuance']}},
  {path:'examinations/:id/results',loadComponent:()=>import('./features/examinations/examination-results-page').then(m=>m.ExaminationResultsPage),data:{policies:examinationPolicies}},
  {path:'examinations/approvals',loadComponent:()=>import('./features/examinations/examinations-page').then(m=>m.ExaminationsPage),data:{mode:'approval',policies:examinationApprovalPolicies}},
  {path:'examinations',loadComponent:()=>import('./features/examinations/examinations-page').then(m=>m.ExaminationsPage),data:{policies:examinationPolicies}},
  {path:'timetable',loadComponent:()=>import('./features/timetable/timetable-page').then(m=>m.TimetablePage),data:{policies:timetablePolicies}},
  {path:'employees',loadComponent:()=>import('./features/employees/employees-directory-page').then(m=>m.EmployeesDirectoryPage),data:{policies:employeePolicies}},
  {path:'employees/new',loadComponent:()=>import('./features/employees/employee-form-page').then(m=>m.EmployeeFormPage),data:{policies:employeePolicies}},
  {path:'employees/:id/edit',loadComponent:()=>import('./features/employees/employee-form-page').then(m=>m.EmployeeFormPage),data:{policies:employeePolicies}},
  {path:'employees/:id',loadComponent:()=>import('./features/employees/employee-details-page').then(m=>m.EmployeeDetailsPage),data:{policies:employeePolicies}},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}]},

 // Backwards-compatible student bookmarks.
 {path:'my-academic-record',redirectTo:'student/academic-record'},
 {path:'my-transcripts',redirectTo:'student/transcripts'},
 {path:'forbidden',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage),data:{code:'403',title:'Access restricted',message:'You do not have permission to view this page.'}},
 {path:'not-found',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage)},
 {path:'**',redirectTo:'not-found'}
];
