# Backend structure

- `src/server.ts` loads environment variables, initializes the database, and starts listening.
- `src/app.ts` assembles the Express application using the initialized database.
- `src/routes/` maps URL paths and HTTP methods to controllers, with authentication and file-upload middleware where applicable.
- `src/controllers/` reads request parameters and bodies, calls services, and sends HTTP responses.
- `src/services/` contains business rules, database reads/writes, password handling, and spreadsheet processing. Services do not receive Express request or response objects.
- `src/middleware/` contains authentication, synthetic latency, and translation of expected service failures into HTTP responses. Unexpected errors continue to Express's default error handler.

For example, `GET /users/:id` goes through `employeeRoutes.ts`, then `employeeController.ts`, then `employeeService.ts`. The controller sends the employee returned by the service as JSON.

The database is initialized once and passed to services. Importing the application does not open a port or initialize storage. `/health` is public and outside the paths selected for synthetic latency.

This organization preserves existing URLs, statuses, response bodies, and authentication requirements. In particular, employee edits and request routes retain their existing public access.

Run `npm run test --workspace=@mono/backend` from the repository root to build and run HTTP regression tests using an in-memory database. Tests do not read or modify the local employee database.
