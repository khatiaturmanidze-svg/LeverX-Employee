# setup and installation

### install dependencies

npm i

### configure env variables

Create a `.env` file in the root directory and define the following variables:
`VITE_API_PORT` -> The port the backend server runs on
`VITE_API_TARGET` -> The full URL the frontend proxies to
`VITE_AUTH_TOKEN` -> Static token for API authorization
`BCRYPT_SALT_ROUNDS` -> Cost factor for password hashing
`DATABASE_PATH` -> Relative path to the JSON database
`VITE_TEST_USER_EMAIL` -> Email for the auto-generated Admin
`VITE_TEST_USER_PASSWORD` -> Password for the auto-generated Admin

### database

- on the first run, the program will automatically generate a fresh db.json file (ignored by Git)
- send the database with they test user credentials defined in your .env (the role of test user is 'admin' by default)

# scripts to run from root directory

- `npm run dev` -> builds the project, then starts the frontend and backend in parallel
- `npm run test` -> runs all unit and integration tests with Vitest
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
