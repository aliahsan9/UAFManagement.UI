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
