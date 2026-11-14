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
