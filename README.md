# setup and installation

### install dependencies

npm i

### configure env variables

Create a `.env` file in the root directory and define the following variables:
`VITE_API_PORT` -> The port the backend server runs on
`VITE_API_TARGET` -> The full URL the frontend proxies to
`VITE_AUTH_TOKEN` -> Static token for API authorization
`BCRYPT_SALT_ROUNDS` -> Cost factor for password hashing
`DATABASE_URL` -> PostgreSQL connection URL used by the backend
`DATABASE_PATH` -> Optional JSON snapshot path for the manual importer, relative to `apps/backend`
`VITE_TEST_USER_EMAIL` -> Email for the explicitly seeded development Admin
`VITE_TEST_USER_PASSWORD` -> Password used when creating that development Admin

### database

Normal startup uses PostgreSQL and does not create/read a JSON database or automatically create an Admin. Start your local PostgreSQL server, create the database named in `DATABASE_URL`, then run from the repository root:

```powershell
npm.cmd run build --workspace=@mono/backend
node apps/backend/dist/scripts/migrate.js
node apps/backend/dist/scripts/seedAdmin.js
```

The seed is optional when you already have an account. It uses the two development-admin settings and preserves an existing account's password and identity.

To transfer an existing JSON snapshot, use the separate importer after schema setup:

```powershell
node apps/backend/dist/scripts/importLowdbReads.js --validate-only
node apps/backend/dist/scripts/importLowdbReads.js --import
```

Keep the original snapshot as a backup. Imports are manual transfers; the running application does not synchronize JSON and SQL. The current credential import uses plain INSERTs, so a second import into an already populated auth table reports a duplicate instead of overwriting passwords.

See [the backend setup and SQL test instructions](apps/backend/README.md) and [the migration course](docs/postgresql-migration-learning-guide.md).

For the current Prisma setup, verified status, and examples from this backend, see [the Prisma guide](docs/prisma-guide.md).

# scripts to run from root directory

- `npm run dev` -> builds the project, then starts the frontend and backend in parallel
- `npm run test` -> runs frontend tests with Vitest
- `npm run test --workspace=@mono/backend` -> builds/runs backend tests; SQL integration cases require `TEST_DATABASE_URL` (see backend README)
- `npm run test:watch` -> runs tests in watch mode
- `npm run test:coverage` -> runs tests with coverage report

# test data

I've included the test spreadsheet at `docs/sample-users-upload.xlsx` for easy access.

# research document and examples

- `apps/frontend/test/docs/rendering-research.md` -> research document comparing DOM, Canvas, WebGL, and WebGPU rendering approaches.
- `apps/frontend/src/pages/test-rendering/` -> example implementation files used by the research page:
  - `DomTest.tsx` -> renders a large grid with regular DOM elements.
  - `CanvasTest.tsx` -> renders the same grid with the Canvas 2D API.
  - `WebGpuTest.tsx` -> renders animated cells with WebGPU instancing.
  - `TestRenderingPage.tsx` -> switches between the available rendering examples.
- `/rendering-test` -> frontend route where the rendering examples can be opened while the app is running.
- `docs/sample-users-upload.xlsx` -> sample spreadsheet for testing employee upload data.
