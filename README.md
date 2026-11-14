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
