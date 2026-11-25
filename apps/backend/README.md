# Backend structure

- `src/server.ts` loads environment variables, connects Prisma to PostgreSQL, and starts listening. Startup validates session configuration and database tables. Shutdown drains HTTP traffic, closes the session store and its pool, and disconnects Prisma.
- `src/app.ts` assembles the Express application from `createApp(prisma, options)`, using one shared Prisma client.
- `src/routes/` maps URL paths and HTTP methods to controllers, with authentication and file-upload middleware where applicable.
- `src/controllers/` reads request parameters and bodies, calls services, and sends HTTP responses.
- `src/services/` contains business rules, database reads/writes, password handling, and spreadsheet processing. Services do not receive Express request or response objects.
- `src/repositories/` contains Prisma queries and transaction-aware persistence helpers, composed once and passed to services.
- `src/middleware/` contains authentication, synthetic latency, and centralized error handling. Expected service failures preserve their response shape; malformed JSON returns `400`, oversized request bodies return `413`, and unexpected failures are logged and return generic `500` JSON.

For example, `GET /users/:id` goes through `employeeRoutes.ts`, then `employeeController.ts`, then `employeeService.ts`. The controller sends the employee returned by the service as JSON.

Importing the application does not open a port or initialize storage. `/health` is public and outside the paths selected for synthetic latency. Normal startup does not read/write `db.json` or seed an account.

Employee, leave, and visa APIs require a verified cookie session and a completed password-change flow. Services receive the verified actor separately from client-selected resource IDs.

## Database setup

Set `DATABASE_URL`, `APP_ORIGIN`, and a stable randomly generated `SESSION_SECRET` (at least 32 bytes) in the repository-root `.env`. Generate the secret once with `node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep secrets out of `VITE_*` settings. Start PostgreSQL and create the selected database first. From the repository root:

```powershell
npm.cmd run build --workspace=@mono/backend
npm.cmd run db:migrate --workspace=@mono/backend
```

Prisma applies the migration history in `prisma/migrations/` and records it in `_prisma_migrations`. The existing `node apps/backend/dist/scripts/migrate.js` command also delegates to Prisma migration deployment. To create a development Admin explicitly, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, then run `npm.cmd run db:seed --workspace=@mono/backend`. An existing account is preserved.

`DATABASE_PATH` is only for a manual JSON snapshot import, relative to `apps/backend`; it is not runtime storage. Validate with `node apps/backend/dist/scripts/importLowdbReads.js --validate-only`, then import with `--import`. The importer uses a Prisma transaction, rejects conflicting identities, and preserves existing credentials on repeated imports. It replaces related visa and request rows for imported employees; treat it as a snapshot transfer rather than ongoing synchronization.

## Visa API

All five visa endpoints are mounted at `/employees/:employeeId/visas`. Employee routes remain at `/users`.

| Method | Path                                   | Success response                       |
| ------ | -------------------------------------- | -------------------------------------- |
| POST   | `/employees/:employeeId/visas`         | `201`, created visa                    |
| GET    | `/employees/:employeeId/visas`         | `200`, `{ items, total, page, limit }` |
| GET    | `/employees/:employeeId/visas/:visaId` | `200`, one visa                        |
| PATCH  | `/employees/:employeeId/visas/:visaId` | `200`, updated visa with the same ID   |
| DELETE | `/employees/:employeeId/visas/:visaId` | `204`, empty body                      |

Every endpoint requires a valid cookie session. Unsafe methods also require the session-bound `X-CSRF-Token` and the exact configured browser Origin. The employee, their direct manager, or an Admin may access visas. Missing authentication returns `401`; failed CSRF or permission checks return `403`. Item operations match both the employee ID and visa ID; a visa belonging to another employee returns `404` under the wrong employee URL.

POST requires `issuing_country`, `type`, `start_date`, and `end_date`. PATCH accepts a nonempty subset of those fields and validates the complete date range against stored values. Dates use `YYYY-MM-DD`; country and type are trimmed nonempty strings. Unknown fields, including body IDs and ownership, are rejected. Responses include string `id` and `employeeId` fields alongside the editable fields; visa IDs support positive signed PostgreSQL `BIGINT` values without JavaScript number conversion.

The list accepts `page` (default `1`), `limit` (default `20`, maximum `100`), and optional `issuing_country` for an exact case-insensitive match. A blank country means no filter. Pagination requires positive whole numbers and a bounded offset; unknown or repeated query parameters are rejected. Results are ordered by `sourcePosition`, then `id`, and `total` counts all filtered matches before pagination.

An existing employee with no matching visas receives an empty page with `200`; a missing employee or scoped visa receives `404`. Invalid visa input returns `400`. Errors use `{ "error": "message" }`, including malformed JSON (`400`), oversized JSON bodies (`413`), and unexpected failures (`500`, without internal details). JSON parsing runs before route authentication and uses Express's default `100kb` limit.

Writes run in Prisma transactions and lock the employee row before reading or changing visa state. The existing bulk profile editor uses the same lock, but still replaces the entire visa array and generates new visa IDs. Clients must refetch after bulk replacement. The frontend currently uses that bulk editor rather than the dedicated visa endpoints.

## Backend checks

Run `npm.cmd run test --workspace=@mono/backend` to build and run tests. Importer unit tests and the public-health/authentication checks do not require a database. SQL HTTP/startup tests are explicitly skipped unless `TEST_DATABASE_URL` is provided; they never fall back to `DATABASE_URL`.

For a complete integration run, start PostgreSQL and copy the root `.env.test.example` to `.env.test`. Set `TEST_DATABASE_URL` there using your local credentials and a database name ending in `_test`. The file is ignored by Git. From the repository root:

```powershell
Copy-Item .env.test.example .env.test
# Edit .env.test with your local PostgreSQL username and password.
npm.cmd run test:db:setup
npm.cmd run test:integration
```

Only copy the example during initial setup; preserve an existing `.env.test`. `test:db:setup` creates the dedicated database if it does not exist and checks connectivity. It connects to the server's `postgres` maintenance database using the test URL's credentials; the role needs database-creation permission for initial setup. It never changes the application's `DATABASE_URL` or seeds a development account.

`test:integration` loads `.env.test`, builds the backend, checks connectivity, and runs the entire backend suite against real PostgreSQL. An existing `TEST_DATABASE_URL` environment variable takes precedence over the file. Missing configuration, a database name without `_test`, or a connection failure stops this command rather than silently skipping integration tests. No separate migration command is needed: each test creates a unique schema, replays the Prisma migration SQL there, and removes only its own schema afterward. The test role needs permission to create schemas.

Visa HTTP/database coverage in `tests/visaRoutes.test.js` and `tests/visaIntegration.test.js` verifies CRUD, authentication for all five endpoints, employee ownership, empty/missing resources, filtering and pagination, invalid IDs/query/body values, merged PATCH date validation, date-only responses, large IDs, malformed/oversized JSON, database rollback, and concurrent POSTs with ordering gaps. Existing tests also cover normalization, imports, date migration, employee bulk editing, auth, roles, requests, uploads, and startup persistence.

The root `npm.cmd run test` command still runs frontend tests only. CI runs that command plus `npm run test:integration --workspace=@mono/backend`, with a PostgreSQL 18 service and a dedicated test database.

## Cookie authentication and permissions

The browser first calls `GET /api/me`, then `GET /api/csrf`. Vite removes `/api` before proxying to Express. Login and signup require the anonymous session cookie and CSRF token; successful authentication regenerates both and persists the session before replying. React keeps identity and CSRF state in Redux memory. It never reads or writes a login credential in web storage. Every API slice includes cookies and uses the shared CSRF wrapper; uploads let Fetch set the multipart boundary.

`POST /set-new-password` accepts only `{ newPassword }`. The server derives the target from the session, changes the hash/flag/version in one transaction, and issues a replacement session. Other browsers fail their next account-version check. This is the required temporary-password flow; ordinary voluntary password changes and forgotten-password reset are separate features. Passwords are at least eight characters and at most 72 UTF-8 bytes. `POST /sign-out` destroys the stored session and clears its cookie; a failed store operation is not reported as logout success.

The directory and individual employee detail pages expose work contact details to signed-in employees. Birth, travel, and leave details are returned only for the actor, direct reports, or an Admin. Viewing another employee's work profile does not grant permission to edit it or access their leave and visa APIs. Admins create/import employees and assign one of Employee, HR, or Admin; managers may edit direct-report profiles but cannot change a manager or role. Visa access is limited to owner/direct manager/Admin. Employees create only their own leave; direct managers or Admins approve other employees' pending requests, with self-approval forbidden. HR has ordinary employee permissions until a separate HR policy is approved.

Sessions have a 30-minute idle timeout, an eight-hour absolute cap, or a seven-day cap with remember-me. Remember-me does not extend the idle timeout. Runtime sessions and abuse counters live in PostgreSQL and are shared across API instances. Public CSRF creation is limited to 120 requests per ten minutes per client IP; login/signup/password submissions share 30 attempts per 15 minutes per IP. Database failures fail closed. Audit events contain action, actor ID, status, and time, never bodies, cookies, password hashes, or CSRF values.

Local HTTP uses `leverx.sid`; production HTTPS uses `__Host-leverx.sid`, HttpOnly, Secure, SameSite=Lax, Path=/, without Domain. `APP_ORIGIN` is the browser-visible origin. Production disables public signup unless `ALLOW_PUBLIC_SIGNUP=true` is deliberately configured. Local signup remains an Employee-role demo feature and does not verify employment or email ownership.

Leave `TRUST_PROXY` unset for a direct connection. For TLS termination, configure only the verified trusted proxy IPs/subnets or verified hop count, isolate the backend from direct Internet traffic, and have the last trusted proxy overwrite forwarded headers. Blanket `true` is rejected. Cookie flags are tested behind an isolated trusted loopback proxy, but the actual deployment's routing, HTTPS, static-host CSP/HSTS, log redaction, and proxy trust still require deployment-specific verification. When rotating the signing secret, replace it consistently on all API instances; existing cookies will require a new login. Do not generate a new key on each boot.

Application errors are logged as sanitized categories. Configure proxy/monitoring tools to redact Cookie, Set-Cookie, X-CSRF-Token, Authorization, and password-bearing request bodies. The API sets a restrictive script CSP for static content it serves; apply equivalent headers to the deployed frontend host. Existing React rendering escapes plain text; do not add untrusted HTML rendering.
