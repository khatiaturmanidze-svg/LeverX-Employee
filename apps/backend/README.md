# Backend structure

- `src/server.ts` loads environment variables, checks the PostgreSQL connection, and starts listening. Shutdown closes the HTTP server and its pool.
- `src/app.ts` assembles the Express application from `createApp(pool, options)`, using one shared PostgreSQL pool.
- `src/routes/` maps URL paths and HTTP methods to controllers, with authentication and file-upload middleware where applicable.
- `src/controllers/` reads request parameters and bodies, calls services, and sends HTTP responses.
- `src/services/` contains business rules, database reads/writes, password handling, and spreadsheet processing. Services do not receive Express request or response objects.
- `src/middleware/` contains authentication, synthetic latency, and translation of expected service failures into HTTP responses. Unexpected errors continue to Express's default error handler.

For example, `GET /users/:id` goes through `employeeRoutes.ts`, then `employeeController.ts`, then `employeeService.ts`. The controller sends the employee returned by the service as JSON.

SQL repositories are composed once and passed to services. Importing the application does not open a port or initialize storage. `/health` is public and outside the paths selected for synthetic latency. Normal startup does not read/write `db.json` or seed an account.

This organization preserves existing URLs, statuses, response bodies, and authentication requirements. In particular, employee edits and request routes retain their existing public access.

## Database setup

Set `DATABASE_URL` in the repository root `.env`. Start PostgreSQL and create the selected database first. From the repository root:

```powershell
npm.cmd run build --workspace=@mono/backend
node apps/backend/dist/scripts/migrate.js
```

The schema runner applies numbered files from `sql/schema/` and records them in `schema_migrations`. To create a development Admin explicitly, set `VITE_TEST_USER_EMAIL` and `VITE_TEST_USER_PASSWORD`, then run `node apps/backend/dist/scripts/seedAdmin.js`. An existing account is preserved.

`DATABASE_PATH` is only for a manual JSON snapshot import, relative to `apps/backend`; it is not runtime storage. Validate with `node apps/backend/dist/scripts/importLowdbReads.js --validate-only`, then import with `--import`. Credential inserts currently reject duplicate imports; do not use the importer as synchronization after SQL has accepted new writes.

## Backend checks

Run `npm.cmd run test --workspace=@mono/backend` to build and run tests. Importer unit tests and the public-health/authentication checks do not require a database. SQL HTTP/startup tests are explicitly skipped unless `TEST_DATABASE_URL` is provided; they never fall back to `DATABASE_URL`.

Create a separate PostgreSQL database whose name ends in `_test`, then set its URL in the PowerShell session:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://USER:PASSWORD@localhost:5432/leverx_employee_test'
npm.cmd run test --workspace=@mono/backend
```

Each integration test creates a unique schema in that dedicated database, applies the SQL schema files there, and removes only its own schema afterward. The test role needs permission to create schemas. HTTP tests cover sign-up/sign-in, required passwords, employees, roles, requests, uploads, and retries. The startup test starts the actual backend twice and checks persistence without creating a JSON file.

## Deferred legacy code

The separate visa service/router remains an unmounted practice exercise and still uses lowDB. `src/database.ts` and `services/types.ts` remain only for that legacy exercise; the SQL application does not import them. The lowDB dependency is retained while those files still require it. Existing visa records in employee responses already come from SQL. See [the Step 15 report](../../docs/postgresql-migration/step-15-status.md).
