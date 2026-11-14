# UAF Management System — Frontend

Angular 22 standalone application for the University of Agriculture, Faisalabad Management System.

## Requirements

- Node.js 22.22.3 or later in the Node 22 line
- npm 11
- UAF API running locally at `https://localhost:7043`

## Run locally

```bash
npm ci
npm start
```

Open `http://localhost:4200`.

## API configuration

The development API base URL is configured in `src/environments/environment.ts`. Update `apiBaseUrl` for your local or deployed API.

The backend must allow the frontend origin under `Cors:AllowedOrigins`. For local development, include `http://localhost:4200`. The API must allow credentials and the `X-Refresh-Request` header (the current backend already configures credentials and this header).

## Authentication security

- Access tokens are held in application memory; they are not written to localStorage or sessionStorage.
- The refresh credential is managed by the API as an HttpOnly cookie.
- Refresh and revoke requests send `X-Refresh-Request: 1` and include credentials.
- A shared refresh observable prevents concurrent protected requests from triggering parallel refresh calls.
- A failed refresh clears the in-memory session.
- Client-side guards improve navigation UX. All authorization decisions must still be enforced by the API.

## Project structure

- `core/models`: API and authentication contracts
- `core/services`: authentication, loading, notifications and confirmation state
- `core/interceptors`: bearer token/refresh handling and centralized HTTP errors
- `core/guards`: authenticated and role-based route guards
- `features/auth`: login and registration experiences
- `features/dashboard`: initial authenticated landing page
- `features/errors`: forbidden and not-found states
- `layouts`: authenticated application shell
- `shared/components`: global toast and confirmation dialog

## Build and tests

```bash
npm run build
npm test
```

GitHub Actions runs the production build for feature branch pushes and pull requests.


## Phase 2 — Admin dashboard

The dashboard reads live figures from the existing backend resources; it does not use hardcoded demo statistics.

| Dashboard metric | Backend resource | Aggregation |
| --- | --- | --- |
| Total students | `GET /api/v1/students/?page=1&pageSize=1` | `totalCount` |
| Student standing breakdown | `GET /api/v1/students/` with `status` filters | Current counts for Active, Suspended, Graduated and Withdrawn |
| Total employees | `GET /api/v1/employees/?page=1&pageSize=1` | `totalCount` |
| Academic programs | `GET /api/v1/academic-structure/programs` | Returned program count |
| Active academic sessions | `GET /api/v1/academic-sessions/` | Count of sessions with Active status |

Each resource is handled independently. If an endpoint returns 403, 404, or a network error, its widget displays an unavailable state rather than a misleading zero. This is important because the backend applies separate authorization policies to student, employee, academic-structure, and catalog resources.

### Dashboard capabilities not yet supported by the current API

The following widgets are deliberately shown as API gaps instead of displaying invented figures:

- **Admission statistics / pending decisions:** admission staff workflows and decision history exist, but there is no staff-wide paged admission-application listing or aggregate endpoint.
- **Finance overview:** the API exposes student fee accounts and payment operations, but not institution-wide financial totals.
- **Attendance overview:** reports are scoped to a course offering; no university-wide aggregate endpoint is exposed.
- **Recent activities:** there is no consolidated activity-feed endpoint.

For production-grade dashboard analytics, add an authorized, purpose-built endpoint such as `GET /api/v1/dashboard/summary` in the backend. It should return role-filtered aggregate metrics, time-series buckets, pending workflow counts, recent audit/activity entries, and generated-at metadata in one efficient read model. Avoid making the frontend fan out to every module as the dashboard grows.

## Phase 3 — University and academic structure

The academic-structure UI is implemented against the backend AcademicStructureEndpoints.cs and its request/response records. It calls only existing /api/v1/academic-structure endpoints; no client-side mock records or guessed routes are used.

| Screen | API operations |
| --- | --- |
| Universities | GET/POST /universities, PUT /universities/{id} |
| Campuses | GET /campuses?universityId=..., POST, PUT /campuses/{id}, DELETE /campuses/{id} |
| Faculties | GET /faculties?universityId=..., POST, PUT /faculties/{id}, DELETE /faculties/{id} |
| Departments | GET /departments?facultyId=..., POST, PUT /departments/{id}, DELETE /departments/{id} |
| Academic programs | GET /programs?departmentId=..., POST, PUT /programs/{id}, DELETE /programs/{id} |

**Actual hierarchy:** University → Campus and University → Faculty → Department → Academic Program. Campus is a sibling branch under University, not a parent of Faculty. Create forms use cascading university/faculty/department selectors. Update DTOs omit parent IDs, so existing parent relationships are preserved during edits. Deactivation is available only where the backend exposes DELETE; universities do not have a deactivation action.

The backend requires its AcademicStructureAdmin authorization policy, which checks the academic-structure.manage permission. The API remains the source of truth for assigning that permission to users and roles. The frontend route guard is a navigation aid; backend authorization remains authoritative. Bootstrap 5.3.8 CSS is loaded globally and used for the Phase 3 layout, cards, tables, form controls, badges and modal structure. The modal is controlled by Angular; no Bootstrap JavaScript bundle is required.

## Phase 4 — Academic sessions and courses

Implemented with the API contracts in `AcademicCatalogEndpoints.cs` and `AcademicCatalogModels.cs`. All pages are lazy-loaded and protected by the `academic-catalog.manage` permission; the backend authorization policy remains authoritative.

### Academic sessions

| UI capability | API |
| --- | --- |
| List / status filter | `GET /api/v1/academic-sessions/?status={Planned|Active|Completed|Cancelled}` |
| Create | `POST /api/v1/academic-sessions/` |
| Edit | `PUT /api/v1/academic-sessions/{id}` |
| Details | `GET /api/v1/academic-sessions/{id}` |
| Activate | `POST /api/v1/academic-sessions/{id}/activate` |
| Complete | `POST /api/v1/academic-sessions/{id}/complete` |
| Cancel | `POST /api/v1/academic-sessions/{id}/cancel` |

Session status values follow the backend enum: Planned=1, Active=2, Completed=3, Cancelled=4. The UI respects lifecycle rules: only Planned sessions can activate; only Active sessions can complete; only Planned or Active sessions can be cancelled. Active and Completed sessions cannot be edited. The date range is validated in the form and again by the API/domain.

### Courses

| UI capability | API |
| --- | --- |
| List and department/active filters | `GET /api/v1/courses/?departmentId={id}&isActive={true|false}` |
| Create | `POST /api/v1/courses/` |
| Edit | `PUT /api/v1/courses/{id}` |
| Details | `GET /api/v1/courses/{id}` |
| Deactivate | `DELETE /api/v1/courses/{id}` |
| Reactivate | `POST /api/v1/courses/{id}/reactivate` |

Course creation selects an active department. Department ownership is immutable in the update DTO, so the department selector is locked during editing and no parent ID is sent on update. Credit hours are stored as decimal(4,2), so the UI accepts 0.01–10.00. Course descriptions are limited to 1,000 characters. Course codes are normalized to uppercase. The API can reject deactivation when draft or published offerings exist; the UI displays the backend error rather than silently changing the course.

The course details response contains the department ID rather than a department display name. The UI resolves that ID against the existing academic-structure departments endpoint; no department names are fabricated. Note that this lookup endpoint has its own `academic-structure.manage` authorization policy, separate from `academic-catalog.manage`. The courses page handles a denied lookup explicitly and prevents course creation until the department options are available. All screens use the existing Bootstrap 5.3.8 styling system.

## Phase 5 — Admissions management

The admissions frontend is split into two experiences with separate route shells:

- Applicant portal: /applicant/login, /applicant/register, /applicant/dashboard, /applicant/applications, create/edit draft, application details, document upload/download, submission readiness, submit/withdraw actions and application timeline.
- Admissions staff portal: /admissions/staff, paged/filterable review queue, staff-created draft, application review, document verification/rejection, decision history, accept/reject/waitlist/withdraw, registration-series configuration and accepted-applicant conversion.

The typed AdmissionsService maps to the existing backend endpoints in ApplicantAdmissionEndpoints.cs, AdmissionsEndpoints.cs, and AdmissionDocumentReviewEndpoints.cs. Applicant API calls remain scoped to the authenticated applicant by the backend. Staff routes use the Admissions.Staff permission; decision and registration configuration screens additionally require Admissions.Decision. Client guards are only a UX layer; API policies are authoritative.

### Staff queue API gap closed in backend

| Endpoint | Purpose |
| --- | --- |
| GET /api/v1/admissions/?status=&academicProgramId=&search=&page=1&pageSize=20 | Paged staff queue with optional status, program and applicant/application search filters |
| GET /api/v1/admissions/{id} | Staff application detail including review and decision metadata |

The query is implemented in the application service and EF Core repository, applies bounded page sizes (1–100), stable newest-first ordering, and returns items, page, pageSize, totalCount, and totalPages. Both endpoints inherit Admissions.Staff authorization from the route group. Applicant ownership endpoints remain separate and are not reused for staff access.

The applicant portal uses the applicant-authorized GET /api/v1/applicant/admissions/programs lookup to populate a real active-program selector. The registration-series and staff-created draft forms currently accept the academic program GUID because the staff workflow does not expose a registration-series read endpoint or program-name lookup.

Document uploads use multipart form data and are restricted by the API to PDF/JPEG/PNG up to 10 MB. Submission readiness is derived from the configured required-document list and verified document statuses. The frontend does not claim an application is ready unless the backend readiness endpoint returns canSubmit=true.


## Phase 6 — Student management

The student module is implemented against StudentEndpoints.cs and StudentModels.cs. Routes are lazy-loaded and protected by the students.manage permission, which matches the API StudentManagement policy.

### Directory and profile API mapping

| UI capability | API |
| --- | --- |
| Paginated directory, search, program/status filters, sorting | GET /api/v1/students/?page=&pageSize=&academicProgramId=&status=&search=&sortBy=&sortDirection= |
| Student details | GET /api/v1/students/{id} |
| Create student | POST /api/v1/students/ |
| Edit personal profile | PUT /api/v1/students/{id}/profile |
| Change academic program | PUT /api/v1/students/{id}/academic-program |
| Suspend / reactivate / graduate / withdraw | POST /api/v1/students/{id}/{suspend|reactivate|graduate|withdraw} |

Status values follow the backend enum: Active=1, Suspended=2, Graduated=3, Withdrawn=4. Registration number and enrollment date are set only at creation; profile editing updates full name, email and phone only. Program options use the existing academic-structure API and include only active programs. If program lookup is forbidden, the UI reports that permission gap rather than fabricating options.

### Student profile tabs

- Personal information, registration information and academic program use the student profile response.
- Academic status history is rendered only when a statusHistory collection is actually returned. The current StudentResponse contract does not expose it.
- Attendance discovers enrolled offerings, then calls the existing per-offering attendance report API. This is on-demand and requires course-offering and attendance-report permissions.
- Examination results discover enrolled offerings and fetch only published results from GET /api/v1/examinations/{id}/results. This requires course-offering and examination permissions.
- Fee account loads independently from GET /api/v1/finance/students/{studentId}/account; finance authorization is enforced by the API.
- Academic Records does not misuse the self-service /api/v1/academic-records/me/transcripts route for a different student. A staff-authorized studentId-scoped academic-record query is needed before this tab can show another student's transcript history.

Attendance and examination APIs are offering-scoped, not student-scoped. The frontend discovers the student's enrolled offerings first and caps parallel requests to avoid unbounded fan-out. A dedicated student academic-summary endpoint would be more efficient at institutional scale.


## Phase 7 — Course offerings and enrollment

Implemented in `src/app/features/course-offerings` against the actual Minimal API contracts in `CourseOfferingEndpoints.cs` and `CourseEnrollmentEndpoints.cs`.

### Routes and workflows

- `/course-offerings`: searchable offering register with course/session/status filters, credit hours, enrollment counts, capacity utilization, and create/edit/lifecycle actions.
- `/course-offerings/:id`: offering details with Overview, Students, and Timetable tabs.
- Create uses `POST /api/v1/course-offerings/` with `courseId`, `academicSessionId`, `section`, `capacity`, and optional `instructorEmployeeId`.
- Edit uses `PUT /api/v1/course-offerings/{id}`; the backend contract only permits capacity and instructor changes, so course/session/section are intentionally immutable in the UI.
- Publish, close, and cancel use their dedicated POST lifecycle routes.
- Enrollment listing uses `GET /api/v1/course-offerings/{id}/enrollments`; enrolling uses `POST /api/v1/course-offerings/{id}/enrollments/{studentId}` with `enrolledOn`.
- Drop, withdraw, and complete use `/api/v1/course-enrollments/{id}/{drop|withdraw|complete}`.
- Timetable is read-only in this phase and queries `GET /api/v1/timetable/entries?courseOfferingId={id}`, then resolves room labels from the timetable room API.

### API and permission notes

The offering and enrollment endpoints both require `CourseOfferings.Management`, mapped to `course-offerings.manage`; the route guard uses that exact permission. The timetable tab requires the separate `timetable.manage` permission. Student lookup/name resolution uses the student-management API and therefore requires `students.manage`; when unavailable, the UI shows a clear permission message or the student ID rather than inventing data.

The backend returns IDs for course, session, instructor and student relationships rather than denormalized names. The UI resolves course and session labels using the existing academic catalog endpoints, and resolves student names individually. Instructor selection remains an optional employee GUID because this offering API does not expose an instructor search endpoint.

Status values match the backend enums: offering Draft=1, Published=2, Closed=3, Cancelled=4; enrollment Enrolled=1, Dropped=2, Completed=3, Withdrawn=4. All important lifecycle and enrollment transitions require confirmation, and the backend remains authoritative for capacity, duplicate enrollment and state validation.

## Phase 8 — Employee and teacher management

Implemented in `src/app/features/employees` against the actual `EmployeeEndpoints.cs` contracts.

### Routes and workflows
- `/employees`: employee dashboard cards and paginated directory with department, category and employment-status filters.
- `/employees/new`: create employee using employee number, name, email, designation, department, category, joining date, optional phone and optional identity user ID.
- `/employees/:id`: employee details with Personal Details, Employment Details, Department, Teacher Qualifications and Academic Rank tabs.
- `/employees/:id/edit`: edit only fields supported by `UpdateEmployeeProfileRequest` (name, email, designation and phone).
- Department transfer uses `PUT /api/v1/employees/{id}/department`; status changes use `PUT /api/v1/employees/{id}/status` with status and optional effective date.
- Academic employees can create/update teacher profile data using dedicated teacher-profile POST/PUT endpoints.

### Contract and authorization notes
- Directory: `GET /api/v1/employees/?page=&pageSize=&departmentId=&status=&category=`; detail: `GET /api/v1/employees/{id}`.
- Create: `POST /api/v1/employees/`; profile update: `PUT /api/v1/employees/{id}/profile`.
- No employee delete, teacher-profile GET, or dedicated employee-dashboard aggregate endpoint is exposed. Dashboard cards are derived from the first 100 employee records, so these are explicitly a snapshot rather than institution-wide authoritative totals when the dataset exceeds that window.
- Teacher profile update is supported by the backend, but there is no read endpoint to detect an existing profile or prefill persisted values. The UI therefore cannot automatically determine create versus update for profiles created before this session; a backend teacher-profile GET endpoint is required for full persisted profile editing.
- Department names use the existing academic-structure departments endpoint. That lookup additionally requires `academic-structure.manage`; if unavailable, the employee remains accessible and the UI falls back to the department identifier.
- Employee endpoints inherit `Employees.Management`, mapped to `employees.manage`. The route guard is a navigation aid; API authorization remains authoritative.


## Phase 9 — Timetable and room management

Implemented in `src/app/features/timetable` against `TimetableEndpoints.cs` and the actual `TimetableModels.cs` records.

### Screens and workflows
- `/timetable`: scheduling workspace with Timetable Calendar, Teaching Rooms and Entry List views.
- Teaching room directory supports campus filtering, room details and creation.
- Calendar supports Daily, Weekly, Course-wise and Room-wise views over the backend's recurring weekly entries.
- Entry list supports academic-session filtering and room/campus scoping.
- Create timetable entry sends course offering, room, .NET DayOfWeek value (Sunday=0), local start/end times, and effective date range.
- Entry details are loaded from the dedicated detail endpoint; cancellation uses DELETE and requires confirmation.

### Backend validation and conflict handling
The frontend does not attempt to replace backend conflict detection. On save, it submits the request to the API and surfaces ProblemDetails validation messages. HTTP 409 is highlighted as a room/time conflict; other errors (invalid date range, insufficient room capacity, inactive room, closed/cancelled offering/session, missing references, etc.) are shown with the backend's detail and validation errors. No optimistic schedule insertion occurs after a failed response.

### API mapping
- Rooms: `GET /api/v1/timetable/rooms?campusId=`, `GET /rooms/{id}`, `POST /rooms`.
- Entries: `GET /entries?academicSessionId=&courseOfferingId=`, `GET /entries/{id}`, `POST /entries`, `DELETE /entries/{id}`.
- Room creation uses the existing campus lookup. Course offering, academic session and course labels use their existing module APIs.

### Permissions and API gaps
- Timetable endpoints inherit `Timetable.Management`, mapped to `timetable.manage`; route guard is a navigation aid and backend authorization is authoritative.
- Campus names require `academic-structure.manage`; session/course lookups require `academic-catalog.manage`; offering lookup requires `course-offerings.manage`. If a supporting lookup is denied, the page reports that limitation and displays the stable IDs rather than inventing names.
- The backend models timetable entries as recurring weekly slots, not one-off dated meetings. The daily and weekly calendar views therefore evaluate each slot against its effective date range and weekday.
- Room creation is supported, but no room update/deactivate endpoint is exposed in the timetable route group.
- The API exposes no room-specific or date-window query for entries; the UI applies room and calendar filtering to the session-scoped/all entries returned by the backend. For large institutions, add server-side room/date filters and a paged timetable query.


## Phase 10 — Attendance management

Implemented under `src/app/features/attendance` against the backend `AttendanceEndpoints.cs`, `AttendanceModels.cs`, and `AttendanceReportModels.cs`.

### Workflows
- Attendance dashboard scoped to the selected course offering and currently loaded session.
- Create a session for a course offering and date; load an existing session by its returned ID.
- Bulk attendance table populated from the offering's currently enrolled students.
- Exact backend enum values: Present=1, Absent=2, Late=3, Excused=4.
- Per-student optional remarks map to backend `Reason`; saved response `Remarks` are rehydrated on session reload.
- Save marks with PUT and finalize an open session with explicit confirmation.
- Course attendance report with per-student counts, attendance percentage, searchable student summaries and below-threshold list.
- Attendance policy read/configure per academic session (required percentage, late credit, exclude excused from denominator).

### Backend contract / important API limits
- `POST /sessions`, `GET /sessions/{id}`, `PUT /sessions/{id}/marks`, `POST /sessions/{id}/finalize`.
- `GET /offerings/{offeringId}/report`.
- Policy: `GET /policies/{academicSessionId}`, `PUT /policies/{academicSessionId}`.
- The backend exposes no session collection/list endpoint, so the UI creates sessions and loads an existing session by ID; it does not invent a session-history API.
- The backend exposes no standalone student attendance report endpoint; student summaries and below-threshold filtering are derived from the authoritative course report response.
- Report calculation requires a configured attendance policy and only includes finalized sessions.
- Student display names are resolved through the existing Students API; if its separate permission is absent, stable student IDs remain visible.
- Attendance management requires `attendance.manage`; policy configuration additionally requires `attendance-policy.manage`. The policy form surfaces authorization failures returned by the server.
- Server remains authoritative for offering assignment, duplicate session dates, mark eligibility, state transitions and report calculations.


## Phase 11 — Examination management

Implemented in `src/app/features/examinations` against the actual `ExaminationEndpoints.cs`, `ExaminationModels.cs`, `ExaminationType` and `ExaminationStatus` contracts.

### Examination management

- `/examinations`: offering-scoped dashboard and examination list, create draft, details, schedule, open marks entry, bulk marks table, save marks and submit.
- Examination types use backend enum values: Quiz=1, Assignment=2, Midterm=3, Final=4, Practical=5, Project=6.
- Lifecycle values use backend enum values: Draft=1, Scheduled=2, MarksEntryOpen=3, Submitted=4, Approved=5, Published=6, Cancelled=7.
- Marks table displays registration number, student name, marks obtained, absent flag and remarks. Client validation enforces 0..maximum marks and absent=0; server validation remains authoritative.
- Each save requires an audit reason because the backend requires a non-empty `Reason` on every `ExaminationMarkItem`. Student remarks are sent separately in `Remarks`.
- Results are loaded only after publication.

### Separate approval and publication workflow

- `/examinations/approvals` is a separate route and screen for submitted-result approval and approved-result publication.
- Examination management route requires `examinations.manage`.
- Approval route requires both `examinations.manage` (the backend applies this policy to examination list/detail reads) and `examinations.approve` (the backend applies its separate ExaminationApproval policy to approve/publish commands).
- The backend rejects self-approval when the submitting user attempts to approve their own results. The UI explains this and displays the submitter identity.

### Actual backend API mapping

| UI operation | API |
| --- | --- |
| Create draft | `POST /api/v1/examinations/` |
| Offering examination list | `GET /api/v1/examinations/offerings/{offeringId}` |
| Examination details | `GET /api/v1/examinations/{id}` |
| Schedule | `POST /api/v1/examinations/{id}/schedule` |
| Open marks entry | `POST /api/v1/examinations/{id}/open-marks-entry` |
| Save marks | `PUT /api/v1/examinations/{id}/marks` |
| Submit | `POST /api/v1/examinations/{id}/submit` |
| Approve | `POST /api/v1/examinations/{id}/approve` |
| Publish | `POST /api/v1/examinations/{id}/publish` |
| Published results | `GET /api/v1/examinations/{id}/results` |

### API constraints surfaced in the UI

- The backend exposes no examination update/delete/cancel endpoint and no examination-wide list; listing is scoped to a selected course offering.
- The examination detail response does not include draft marks, and there is no marks-read endpoint before publication. The UI therefore cannot prefill already-saved marks when an operator reloads an open marks-entry screen; it does not fabricate saved values.
- Approval and publication have separate backend authorization policies. The backend has no approval-queue listing endpoint; the approval screen uses the management-protected offering list/detail reads and therefore needs both read/manage and approval permissions.
- The backend enforces course-offering ownership, academic-session date boundaries, lifecycle transitions, maximum marks, absent=zero, mandatory audit reasons, and separation of duties. Client checks improve feedback but do not replace those validations.


## Phase 12 — Grading and GPA management

Implemented in `src/app/features/grading` against the backend `GradingEndpoints.cs`, `GradeAppealEndpoints.cs`, `GradeRevisionEndpoints.cs` and their application DTOs.

### Grade scale management — `/grading/scales`

- Academic-session selector and session-specific grade scale lookup.
- Grade scale builder with configurable name, failed-course GPA inclusion and repeat-course policy.
- Grade band editor: letter grade, minimum percentage, grade points and passing criterion.
- Client validation mirrors backend invariants: 1–30 bands, unique letter grades and thresholds, at least one 0% band, percentage 0–100, grade points 0–10.
- Publish scale with explicit confirmation. Published scales are immutable and are required before finalization.
- Repeat-course policies match backend enum values: AllAttempts=1, LatestAttempt=2, HighestGrade=3.

### Course grade finalization — `/grading/finalization`

- Select published or closed course offerings and load eligible Enrolled / Completed enrollments.
- Finalize each student independently using published examination assessments and the published session scale.
- Show returned course-grade details: marks, percentage, letter grade, grade points and pass/fail.
- Backend remains authoritative for course offering ownership, department permissions, published assessments, scale publication, duplicate finalization and transactional grade creation.

### Student GPA and grade appeal portal — `/my-academic-record`

- Student-only route backed by `GET /api/v1/academic-records/me`.
- Cumulative GPA and credit-hour summary, semester GPA cards, GPA history chart and course grade details.
- Student grade appeal form and appeal history/status table.
- Per-course revision request and approved revision history, using the student-only course-grade history endpoints.

### Staff appeal and revision workflows

- `/grading/appeals`: pending appeal queue, appeal reason, required decision remarks, approve/reject confirmation and append-only appeal history.
- `/grading/revisions`: submit a revision request with course grade ID, approved appeal ID, proposed marks and reason; view pending requests.
- `/grading/revisions/approvals`: separate revision approval route, required decision remarks and before/after comparison of marks, percentage, letter grade, grade points and pass status.
- Separate permission guards mirror backend permission names:
  - `grading-scales.manage`
  - `course-grades.manage`
  - `grade-appeals.review`
  - `grade-revisions.manage`
  - `grade-revisions.approve`
  - Student academic-record routes require the `Student` role.

### Actual endpoint mapping

| UI operation | API |
| --- | --- |
| Get scale for session | `GET /api/v1/grading/scales/sessions/{academicSessionId}` |
| Create scale | `POST /api/v1/grading/scales/` |
| Publish scale | `POST /api/v1/grading/scales/{scaleId}/publish` |
| Finalize student course grade | `POST /api/v1/grading/offerings/{offeringId}/students/{studentId}/finalize` |
| My academic record / GPA | `GET /api/v1/academic-records/me` |
| Submit / list my appeals | `POST/GET /api/v1/academic-records/me/grade-appeals/` |
| Pending staff appeals | `GET /api/v1/grading/grade-appeals/pending` |
| Appeal history / decision | `GET /api/v1/grading/grade-appeals/{appealId}/history`; `POST /api/v1/grading/grade-appeals/{appealId}/decision` |
| Request grade revision / pending requests | `POST /api/v1/grading/grades/{gradeId}/revision-requests`; `GET /api/v1/grading/revision-requests/pending` |
| Decide revision | `POST /api/v1/grading/revision-requests/{requestId}/decision` |
| My revision requests / history | `GET /api/v1/academic-records/me/course-grades/{gradeId}/revision-requests`; `GET /api/v1/academic-records/me/course-grades/{gradeId}/revisions` |

### Backend limitations surfaced instead of inventing APIs

- No all-scales collection or scale-update endpoint: scales are loaded by academic session and all bands must be configured during creation. The backend permits one scale per session; published scales are immutable, and an existing draft cannot be edited through the exposed API.
- No course-grade list or detail endpoint for staff: finalization returns the grade details; the student academic record returns that student's own course-grade attempts.
- No staff endpoint to fetch another student's GPA record; the academic record endpoint is restricted to the authenticated Student role.
- No approved-appeals collection or appeal detail endpoint. After approval, the UI surfaces the appeal and course-grade IDs so an authorized revision officer can submit a request.
- No staff grade-revision history endpoint. Students can view their own requests and approved revisions per course grade.
- GPA and repeat-course calculations are server-derived. The chart visualizes returned semester GPAs and never recalculates them in the browser.
- Duplicate grade finalization is rejected by the backend. Because no grade-read endpoint exists for staff, the UI cannot preload previously finalized rows after refresh.


## Phase 13 — Finance and fee management

Implemented in `src/app/features/finance` against the backend `FeeEndpoints.cs`, fee application DTOs and the existing analytics dashboard endpoint.

### Finance dashboard — `/finance`

- University-level outstanding balance from `GET /api/v1/analytics/dashboard` (verified payments are deducted by the backend analytics query).
- University-wide student totals from the same analytics response.
- Student-account outstanding balance, challan count and pending payment verification cards when a student account is loaded.
- Finance shortcuts to fee heads, fee structures, challan generation and student accounts.

### Fee heads

- Create fee head with code, name and mandatory flag.
- Client-side constraints follow domain limits: code 30 chars, name 120 chars, required code with letters/numbers/underscore/hyphen.
- Newly created IDs are retained in page memory and can be copied or selected when building a fee structure.

### Fee structures

- Dynamic fee structure builder for academic program ID, academic session ID, semester number, name and one or more fee items.
- Fee item IDs must be unique and amounts must be positive with two decimal places.
- Create structure as a draft, then explicitly confirm and publish it.
- Created structure IDs and publication state are retained in page memory.

### Student challans and accounts

- Generate a challan for a student and a published fee structure with issue date, due date and late fee.
- Date validation prevents a due date before issue date.
- The challan creation endpoint returns only an ID; after generation the UI reloads the student's account to retrieve the persisted challan number, totals and status.
- Student fee account view displays outstanding balance, challan summary, payment history and verification state.
- Record payment against a selected challan with amount, method and reference number.
- Client checks remaining balance using verified payments currently present in the account snapshot; the backend's serializable transaction and overpayment check remain authoritative.

### Payment verification

- Separate Payment Entry Form and Payment Verification Modal.
- Approve/reject are explicit, confirmed actions.
- Rejection requires remarks; verification remarks are retained in the payment record.
- Backend requires a different authorized officer from the officer who recorded the payment. The current payment response omits `RecordedByUserId`, so the UI explains this rule and the API remains authoritative.

### Actual endpoint mapping

| UI operation | API |
| --- | --- |
| Create fee head | `POST /api/v1/finance/fee-heads` |
| Create fee structure | `POST /api/v1/finance/fee-structures` |
| Publish fee structure | `POST /api/v1/finance/fee-structures/{id}/publish` |
| Generate student challan | `POST /api/v1/finance/challans` |
| Get student fee account | `GET /api/v1/finance/students/{studentId}/account` |
| Record payment | `POST /api/v1/finance/challans/{id}/payments` |
| Verify/reject payment | `POST /api/v1/finance/payments/{id}/verification` |
| Finance dashboard snapshot | `GET /api/v1/analytics/dashboard` |

### Backend limitations and required follow-up GET endpoints

The finance endpoint group currently has no administrative list/read endpoints for fee heads, fee structures, challans or global payments. Therefore:

- Fee head and fee structure collections show only records created in the current page session. Existing IDs can be pasted into the builder when known.
- Challans and payments are shown from a selected student's account; there is no global challan/payment register.
- Student, academic program, academic session and fee-head selection currently uses GUID entry because the finance officer role does not have the student/catalog/academic-structure lookup permissions and the finance API does not provide equivalent lookups.
- The student account DTO provides challan totals/status and payment history, but not individual challan fee-head line items.
- The challan create response contains only the generated ID, not a printable challan payload.
- The payment response omits the recording officer ID, so the frontend cannot pre-check the two-person verification rule.

Recommended backend additions (all under `/api/v1/finance`, protected by `Finance.Management`):
1. `GET /fee-heads` — active fee-head directory, search and pagination.
2. `GET /fee-heads/{id}` — fee-head detail.
3. `GET /fee-structures` — filter by program, session, semester and publication state.
4. `GET /fee-structures/{id}` — structure details including fee-head line items and currency.
5. `GET /challans` — paginated challan register with student, status, issue/due date filters.
6. `GET /challans/{id}` — full challan detail including fee-head lines and verified/unverified payment totals.
7. `GET /payments` — paginated payment register with status, challan and date filters.
8. `GET /payments/{id}` — payment detail including `RecordedByUserId`, verifier and audit metadata.
9. Consider a finance-scoped student lookup endpoint so Finance Officers do not need separate student-management permission for challan workflows.

The UI does not invent these missing reads or treat in-memory session-created items as a persistent register.


## Phase 14 — Academic records and official transcripts

Implemented under `src/app/features/transcripts` and integrated with the existing grading academic-record experience.

### Student academic record

- Reuses the authenticated `GET /api/v1/academic-records/me` endpoint and the existing Academic Record page.
- Existing Semester GPA cards, course-grade table, cumulative GPA and credit-hour breakdown remain the source of truth.
- Student grade appeal history is loaded from `GET /api/v1/academic-records/me/grade-appeals/`.
- Per-course revision requests and approved grade revision history are loaded from the existing student-only course-grade history endpoints.
- Added a direct link from the academic record page to My Transcripts.

### My Transcripts — `/my-transcripts`

- Student-only page.
- Transcript preview renders the current academic record grouped by academic session, with course code/title, credit hours, marks, percentage, letter grade, grade points and semester GPA.
- Clearly labels the live preview as unofficial; it is not represented as an issued document.
- Lists issued transcript metadata returned by the backend.
- Downloads the immutable issued PDF from `GET /api/v1/academic-records/me/transcripts/{transcriptId}/pdf` as a Blob.
- Opens the public verification URL for each transcript.

### Registrar issuance — `/transcripts/issue`

- Protected by the backend-aligned `transcripts.issue` permission.
- Accepts the student GUID and calls `POST /api/v1/transcripts/students/{studentId}/issue`.
- Displays the returned registration number, issued timestamp, verification code and SHA-256 snapshot digest.
- Provides copyable verification code and public verification link.
- Backend rejects issuance when no finalized course grades exist.
- Each issuance stores an immutable point-in-time academic record snapshot; the UI does not create or edit transcript contents.

### Public verification — `/transcript-verification/{verificationCode}`

- Route is deliberately outside the authenticated admin layout and has no auth/role guard.
- Calls the backend's anonymous `GET /api/v1/transcripts/verify/{verificationCode}`.
- Validates the 32-character hexadecimal code shape before requesting verification.
- Shows authentic/not verified result, registration number, issue date and snapshot digest.
- Displays only the public verification DTO returned by the backend; it does not expose the student's full academic record.

### Endpoint mapping

| Feature | Endpoint |
| --- | --- |
| Student academic record | `GET /api/v1/academic-records/me` |
| Student appeal history | `GET /api/v1/academic-records/me/grade-appeals/` |
| Student grade revision requests | `GET /api/v1/academic-records/me/course-grades/{gradeId}/revision-requests` |
| Student grade revision history | `GET /api/v1/academic-records/me/course-grades/{gradeId}/revisions` |
| My transcripts | `GET /api/v1/academic-records/me/transcripts/` |
| Download PDF | `GET /api/v1/academic-records/me/transcripts/{transcriptId}/pdf` |
| Issue official transcript | `POST /api/v1/transcripts/students/{studentId}/issue` |
| Public verification | `GET /api/v1/transcripts/verify/{verificationCode}` |

No additional read endpoints were necessary for the requested Phase 14 workflows. Transcript history, PDF generation, immutable snapshots, SHA-256 integrity validation and anonymous verification are all supported by the existing backend. Service contract tests cover the student, registrar and public endpoint shapes.


## Phase 15 — Role-specific portals and policy-aware navigation

Introduces separate portal shells and role-aware dashboards. The frontend access map mirrors the backend's `PermissionAuthorizationHandler`, `AuthorizationPolicies` and `AuthorizationPolicyExtensions`.

### Portals

- **Administration Portal** — existing admin shell refactored to show only modules authorized for the signed-in role (university structure, students, catalog, offerings, admissions staff, employees, finance, attendance, examinations, grading, transcripts and timetable).
- **Admissions Staff Portal** — dedicated staff shell for application queues and review. Registration-series access additionally requires the Admissions Decision policy.
- **Applicant Portal** — existing applicant shell remains separate and is now protected by the backend's `Admissions.Applicant` policy (which the backend defines as authenticated `Student` role).
- **Student Portal** — dedicated student shell for own academic record, GPA, appeals/revisions and transcripts.
- **Faculty / Examination Portal** — dedicated Teacher shell with attendance and examination links, each separately guarded by its backend policy.

The shared portal dashboard component renders different titles, descriptions and available module cards per portal type. It does not fabricate operational metrics where no aggregate endpoint exists.

### Backend policy mapping used by the frontend

| Backend policy | UI access |
|---|---|
| `AcademicStructure.Admin` | University structure |
| `Students.Management` | Student management |
| `AcademicCatalog.Management` | Sessions and courses |
| `Admissions.Staff` | Admissions staff portal and queue |
| `Admissions.Decision` | Registration series / decision workflow, in addition to Admissions.Staff |
| `Admissions.Applicant` | Applicant self-service (backend Student role) |
| `Employees.Management` | Employee management |
| `CourseOfferings.Management` | Offerings and enrollment |
| `Attendance.Management` | Attendance |
| `Attendance.PolicyManagement` | Attendance policy tab within attendance management |
| `Examinations.Management` | Examination and marks workflows |
| `Examinations.Approval` | Examination approvals, together with examination management |
| `Grading.ScaleManagement` | Grade scales |
| `Grading.CourseGradeManagement` | Course grade finalization |
| `AcademicRecords.Student` | Student's own academic record and transcript list |
| `Grading.GradeAppealReview` | Staff grade appeal review |
| `Grading.GradeRevisionRequestManagement` | Grade revision request management |
| `Grading.GradeRevisionApproval` | Grade revision approval (separate policy) |
| `Transcripts.Issuance` | Official transcript issuance |
| `Timetable.Management` | Timetable and rooms |
| `Finance.Management` | Finance and fees |
| `Analytics.Read` | Analytics-dependent dashboard access |

### Important authentication contract detail

The backend `GET /api/v1/auth/me` currently returns user ID, full name, email and roles — it does **not** return a permissions array. The access-control helper therefore derives the UI's effective permission hints from the exact role-to-permission map in backend `PermissionAuthorizationHandler`, rather than assuming `CurrentUser.permissions` is populated. It supports explicit permission values if a future backend response includes them.

The helper is used only to improve navigation and route UX. It is not a security boundary. Every protected API endpoint continues to enforce its own backend authorization policy; direct API calls remain protected even if a user manipulates frontend state.

### Route/security changes

- Route metadata now uses backend policy names (`policies`) rather than inconsistent raw permission strings and policy-name aliases.
- Role and policy checks run in route guards, with AND semantics for multiple policies.
- Applicant, student, faculty, admissions staff and administration layouts are separate.
- Student academic record/transcript routes moved into the Student Portal; legacy bookmarks redirect to the new paths.
- Public transcript verification remains outside authenticated portal layouts.
- Grade revision request-management and approval routes now check their distinct backend policies.
- Examination approvals require both Examination Management and Examination Approval.
- Admission decisions require both Admissions Staff and Admissions Decision.

### Tests

Added pure authorization-map tests for Student, Teacher, DepartmentAdmin, Registrar, FinanceOfficer, HRManager and SuperAdmin, including the distinct revision request/approval policies and multi-policy route semantics.


### Operational access notes discovered during integration

- The current backend `GET /api/v1/auth/me` returns roles, not a permission array. The UI derives access hints from the exact `PermissionAuthorizationHandler` role map; it does not assume permissions are returned by the API.
- The backend's `Admissions.Applicant` policy currently requires the `Student` role. Applicant login and routes mirror that policy; a separate Applicant role is not currently defined by the backend policy extension.
- The shared attendance screen needs academic-session, course-offering and student-directory lookups in addition to `Attendance.Management`. The shared examination screen needs course-offering lookups in addition to `Examinations.Management`.
- The backend Teacher role currently receives `attendance.manage` and `examinations.manage`, but does not receive `academic-catalog.manage`, `course-offerings.manage` or `students.manage`. Because the existing shared pages need those lookup permissions, the Faculty Portal intentionally withholds those links instead of showing screens that will immediately return 403. Recommended backend improvement: add teacher-scoped assigned-offering/session/roster read endpoints or narrowly scoped read policies, rather than granting broad administrative management permissions.
- The administration UI does not add a generic reporting card: the backend currently exposes a dashboard analytics snapshot, not a dedicated report catalogue or report-generation workflow. Analytics permission is still required for the finance dashboard snapshot.
- Attendance policy controls are hidden unless `Attendance.PolicyManagement` is granted. Admissions decision buttons and decision history are hidden unless `Admissions.Decision` is granted. The admissions review queue itself remains available to `Admissions.Staff`.
- Examination approval pages require both `Examinations.Management` and `Examinations.Approval`, plus course-offering lookup access used by the current screen.
- The grade revision approval page requires both `Grading.GradeRevisionRequestManagement` (the backend policy protecting the pending queue GET) and `Grading.GradeRevisionApproval` (the decision POST). Request management and approval remain separate policy checks.

### Default portal routing

After standard login and registration, users are routed by backend role:
- Student → `/student/dashboard`
- Teacher → `/faculty/dashboard`
- SuperAdmin, DepartmentAdmin, Registrar, FinanceOfficer, HRManager → `/dashboard`
- Admissions staff with no broader administration role → `/admissions/staff`
- Unknown/unmapped role → `/forbidden`

The root URL uses the same role-aware portal entry behavior. Applicant login remains on the applicant self-service route and verifies the backend Applicant policy after authentication.


## Phase 16 — Shared component library

The application now has a reusable, standalone component library under `src/app/shared/components`. Components use Angular standalone APIs, signal inputs/outputs, content projection where appropriate, and Bootstrap-compatible markup. Import only the components required by a feature; no shared NgModule or new third-party UI dependency is required.

| Component | Public export | Responsibility |
| --- | --- | --- |
| DataTableComponent | `DataTableComponent` | Search, sortable columns, client-side pagination, loading/error/empty states, optional server-side page/sort/query events and row actions |
| SearchFilterComponent | `SearchFilterComponent` | Search input and configurable select filters with clear/reset |
| FormFieldComponent | `FormFieldComponent` | Consistent labels, required indicators, hints, validation messages and projected controls |
| StatusBadgeComponent | `StatusBadgeComponent` | Semantic workflow status labels and tones; retains the legacy active/inactive input |
| ConfirmDialogComponent | `ConfirmDialogComponent` | Shared confirmation surface backed by the existing Promise-based ConfirmationService; Escape and backdrop dismiss safely |
| FileUploadComponent | `FileUploadComponent` | Single/multiple file selection, accepted-type checks, size and count limits, disabled/uploading states |
| FilePreviewComponent | `FilePreviewComponent` | Safe link-based document preview and inline image preview |
| DateRangePickerComponent | `DateRangePickerComponent` | Accessible start/end date selection with range validation |
| PaginationComponent | `PaginationComponent` | Reusable page navigation and item range summary |
| EmptyStateComponent | `EmptyStateComponent` | Configurable no-data messaging and projected actions |
| LoadingSpinnerComponent | `LoadingSpinnerComponent` | Consistent accessible loading indicator |
| ErrorStateComponent | `ErrorStateComponent` | API failure message and optional retry action |
| ToastService | `ToastService` | Public shared toast facade over the existing NotificationService singleton |
| AuditTimelineComponent | `AuditTimelineComponent` | Chronological decision, revision and audit event history |
| StatsCardComponent | `StatsCardComponent` | Dashboard metric card with optional description/trend |
| ChartComponent | `ChartComponent` | Lightweight accessible analytics bar chart without a new chart dependency |
| FilterDropdownComponent | `FilterDropdownComponent` | Reusable typed select filter |

### Usage and architecture

- Import standalone components directly into a consuming standalone component's `imports` array, or use the public exports in `src/app/shared/components/index.ts`.
- Shared components are presentation primitives. Feature services own API calls, DTOs, server filtering, authorization decisions and business rules.
- The table supports local filtering/sorting/pagination by default. Set `serverSide=true` and provide `totalItems` to use `queryChange`, `sortChange` and `pageChange` for server-driven data.
- File upload validates UX-level extension/MIME, size and count constraints. The API must independently validate content, signatures, authorization, malware policy and storage limits; browser validation is not a security boundary.
- File preview uses the supplied URL and does not bypass Angular URL sanitization. Only pass URLs returned by an authorized backend operation.
- `ToastService` is an export alias of the existing `NotificationService`, so existing feature notifications and the global toast container continue to share the same singleton state.
- Existing `DataTable`, `StatusBadge`, confirmation and notification consumers remain compatible. Academic structure now consumes the shared table loading, error and empty states; admissions document upload reuses the generic file selector.
- No generic component makes an API request or grants access to data. Backend policies and API validation remain authoritative.

### Shared component tests

Vitest coverage includes table sorting, filtering, pagination and loading/empty rendering, plus status label/tone behavior and backwards compatibility for active/inactive badges.


## Phase 17 — Backend integration and production readiness

The feature-scoped services remain the owners of module contracts and DTOs. Shared `ApiClient` centralizes transport/query serialization and explicit idempotency support; existing feature models remain endpoint-specific.

- Access tokens stay in memory. Refresh tokens remain HttpOnly cookies. A protected 401 triggers one shared refresh attempt and one request retry; failed refresh returns the user to sign-in. 403 is surfaced and route guards continue to enforce policy-aware navigation for UX only.
- `X-Correlation-ID` is attached to requests and response IDs are retained for diagnostics. The API CORS policy supports this header and exposes it to the browser.
- `Idempotency-Key` is opt-in and validated as 1–128 printable ASCII characters. Finance mutations, admission submission/review/decision/conversion commands, attendance session creation/finalization and official transcript issuance use it. A caller can pass a stable key to reuse across a retry; never reuse a key with a different payload.
- `ServerValidationService` maps backend Problem Details field errors onto Reactive Form controls and returns unmatched messages for a form summary.
- HTTP 409 advises reloading stale data; HTTP 429 shows retry guidance and displays `Retry-After` when exposed by CORS. The current backend exposes `X-Correlation-ID` and `Idempotency-Replayed`; add `Retry-After` to the backend CORS exposed-header list if the browser should read that value. Network/server failures include the correlation reference where available.
- Existing module services and DTOs remain feature-scoped. Admissions staff list already uses supported page/pageSize/status/program/search query fields. Use DataTable server-side mode only where an endpoint supports its documented paging, sorting and filtering contract.
- Existing FormData upload and Blob download endpoints are retained. Browser-side file checks are UX only; API validation remains mandatory.

### System health

- Added a SuperAdmin-only `/system/health` route and navigation link.
- Calls `/health/live`, `/health/ready` and `/health`; displays backend status and reported checks such as SQL Server readiness.
- HTTP 503 is treated as a diagnostic response when the backend returns its health report body. Network/CORS errors are shown as unreachable. The page does not expose secrets or attempt remediation.

### Playwright E2E

- Isolated Playwright workspace under `e2e/` avoids adding browser tooling to the Angular runtime dependencies.
- GitHub Actions installs Chromium and tests accessible login controls and client-side validation.
- Current browser tests are smoke tests; authenticated workflows require a seeded test API identity/environment before they can be reliably exercised.
