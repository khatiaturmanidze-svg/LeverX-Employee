# Backend structure

- `src/server.ts` loads environment variables, connects Prisma to PostgreSQL, and starts listening. Shutdown closes the HTTP server and disconnects Prisma.
- `src/app.ts` assembles the Express application from `createApp(prisma, options)`, using one shared Prisma client.
- `src/routes/` maps URL paths and HTTP methods to controllers, with authentication and file-upload middleware where applicable.
- `src/controllers/` reads request parameters and bodies, calls services, and sends HTTP responses.
- `src/services/` contains business rules, database reads/writes, password handling, and spreadsheet processing. Services do not receive Express request or response objects.
- `src/repositories/` contains Prisma queries and transaction-aware persistence helpers, composed once and passed to services.
- `src/middleware/` contains authentication, synthetic latency, and centralized error handling. Expected service failures preserve their response shape; malformed JSON returns `400`, oversized request bodies return `413`, and unexpected failures are logged and return generic `500` JSON.

For example, `GET /users/:id` goes through `employeeRoutes.ts`, then `employeeController.ts`, then `employeeService.ts`. The controller sends the employee returned by the service as JSON.

Importing the application does not open a port or initialize storage. `/health` is public and outside the paths selected for synthetic latency. Normal startup does not read/write `db.json` or seed an account.

This organization preserves existing URLs, statuses, response bodies, and authentication requirements. In particular, employee edits and request routes retain their existing public access.

## Database setup

Set `DATABASE_URL` in the repository root `.env`. Start PostgreSQL and create the selected database first. From the repository root:

```powershell
npm.cmd run build --workspace=@mono/backend
npm.cmd run db:migrate --workspace=@mono/backend
```

Prisma applies the migration history in `prisma/migrations/` and records it in `_prisma_migrations`. The existing `node apps/backend/dist/scripts/migrate.js` command also delegates to Prisma migration deployment. To create a development Admin explicitly, set `VITE_TEST_USER_EMAIL` and `VITE_TEST_USER_PASSWORD`, then run `npm.cmd run db:seed --workspace=@mono/backend`. An existing account is preserved.

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

Every endpoint requires the configured static token in the raw `Authorization` header, without a `Bearer` prefix. Missing and incorrect tokens return `401` and `403` respectively. Item operations match both the employee ID and visa ID; a visa belonging to another employee returns `404` under the wrong employee URL.

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
