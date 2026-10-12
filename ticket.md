# Employee birthdays and coffee breaks

Status: Ready for implementation

These four tickets cover birthday lookup, a birthday popup after login, coffee-break availability, and coffee-buddy matching. They extend the existing backend and frontend without replacing the `/users` API.

## Shared decisions

- Use an employees router mounted at `/employees`, backed by the same employee data as `/users`.
- Existing `/users` routes, response bodies, and authentication behavior remain compatible.
- Register `/birthdays` before any `/:id` catch-all route.
- Keep routes, controllers, and services separate. Controllers handle HTTP input/output; services handle filtering, date calculations, and storage operations.
- New endpoints require the existing authentication middleware. Preserve its missing-token and invalid-token responses.
- The current shared-token authentication does not prove which employee is making a request. Employee IDs select records; they are not an ownership check. Per-user authorization is a separate prerequisite before exposing break updates in a production system.
- Birthday calendar dates use `Asia/Tbilisi`. Break timestamps use UTC ISO 8601 strings and server time.
- If synthetic latency is enabled, apply it to the new business routes as well. `/health` remains outside that delay.
- Do not return complete employee records when a small public profile is sufficient.

## Ticket 1 — Add upcoming birthday lookup

**Type:** Backend feature  
**Dependency:** None

### User story

As an employee, I want to know whose birthday is today or coming soon so I can congratulate my colleagues.

### API

`GET /employees/birthdays?days=7`

The frontend uses `days=1` for today's birthday popup. The default seven-day window also supports a future upcoming-birthdays widget.

### Acceptance criteria

- Omitted `days` defaults to `7`.
- Accept a single whole-number value from `1` to `366`. Empty, repeated, fractional, nonnumeric, and out-of-range values return HTTP `400` with a clear JSON error.
- The window includes today and the next `days - 1` calendar dates in `Asia/Tbilisi`. For example, seven days starting October 7 includes October 7–13.
- Calculate each employee's next birthday using birth month and day. Ignore birth year; a missing birth year does not exclude a valid month/day.
- Exclude employees with missing or invalid month/day values. Treat February 29 as a valid birthday.
- Observe February 29 birthdays on February 28 in non-leap years.
- Handle month and year boundaries correctly. Compare calendar dates rather than rounded elapsed milliseconds.
- Return each matching employee once, even for a 366-day window.
- Return HTTP `200` with an array containing only `id`, `firstName`, `lastName`, `avatar`, `nextBirthday` (`YYYY-MM-DD`), and `daysUntilBirthday`.
- Do not expose birth year, age, or unrelated employee information.
- Sort by days until birthday, then last name, first name, and ID for deterministic ties.
- No matches returns HTTP `200` with an empty array.
- Include the logged-in employee if their birthday matches; the endpoint does not exclude anyone based on the viewer.
- `/employees/birthdays` must reach this handler rather than an employee-detail handler.

### Verification

- Birthday today, last included date, and first excluded date.
- Month/year rollover and a request near midnight in Tbilisi.
- February 29 in leap and non-leap years.
- Missing birth year, missing month/day, impossible dates, and no matches.
- Default and invalid query parameters; stable ordering for shared birthdays.
- Existing `/users` list/detail behavior and new-route authentication.

## Ticket 2 — Show today's birthdays after login

**Type:** Frontend feature  
**Dependency:** Ticket 1

### User story

As an employee, I want to see today's birthdays after logging in so I can congratulate colleagues without searching for them.

### Acceptance criteria

- After successful login and completion of any required password-change flow, request `GET /employees/birthdays?days=1` using the existing API client and authentication token.
- Show one popup containing all returned employees, with their names and avatars.
- Do not show a popup when the result is empty.
- Show the automatic popup at most once per calendar day per logged-in employee in the same browser. Scope the stored shown marker by employee ID and the Tbilisi date; record it when the popup is shown.
- Use browser storage for this first version. Cross-device synchronization is outside scope; clearing storage can cause the popup to appear again.
- Re-renders, duplicate fetch completion, navigation, and logging out/back in must not produce duplicate automatic popups for the same user/date.
- Allow dismissal with a visible close control and Escape. Manage keyboard focus using the existing accessible dialog pattern, including returning focus after dismissal.
- Provide a dashboard action to reopen today's birthdays manually. Manual opening is not blocked by the automatic-popup marker and fetches the current day's results.
- If a manually opened list has no birthdays, display a friendly empty state.
- A lookup failure must not block login or normal app use. Use existing nonblocking error handling; do not mark the popup as shown when data was not successfully displayed.
- If browser storage is unavailable, fall back to an in-memory shown marker for the current session.
- Do not show age or birth year.

### Verification

- Zero, one, and multiple birthdays.
- Dismissal, keyboard navigation, and manual reopening.
- Repeated login on the same day; another employee using the same browser.
- A new Tbilisi calendar day and browser-storage failure.
- Slow/failed lookup and duplicate rendering without disrupting login.

## Ticket 3 — Start and end a coffee break

**Type:** Backend and frontend feature  
**Dependency:** None

### User story

As an employee, I want to mark myself as on a coffee break so colleagues in my office can see that I am available.

### API and storage

- `POST /employees/:id/coffee-break` starts a break.
- `DELETE /employees/:id/coffee-break` ends a break early.
- `GET /employees/:id/coffee-break` retrieves the current break state, including after a page reload.
- Store break state separately from employee profile fields, keyed by employee ID, in the existing database. This keeps `/users` response shapes unchanged.
- Existing database files without break state are supported and treated as having no active breaks.
- A break contains `startedAt` and `expiresAt` timestamps. The server sets expiry to 15 minutes after the start; the client cannot choose or override these timestamps.

### Acceptance criteria

- All three endpoints return HTTP `404` with a JSON error for an unknown employee.
- Starting a break returns HTTP `200` with `{ "active": true, "startedAt": "<UTC timestamp>", "expiresAt": "<UTC timestamp>" }` and persists the state.
- Starting an already active break returns the existing state without extending its expiry.
- Starting after an old break has expired creates a new 15-minute break.
- An employee marked as remote or without a nonempty building cannot start an office coffee break. Return HTTP `409` with a clear JSON error.
- Retrieving an active break returns HTTP `200` with the active state and timestamps. A missing or expired break returns HTTP `200` with `{ "active": false, "startedAt": null, "expiresAt": null }`.
- Ending a break clears its stored state and returns HTTP `204` with no body. Ending a missing or expired break also returns `204`.
- A break is inactive when server time is equal to or later than `expiresAt`.
- Determine expiry from timestamps when reading or matching. A background timer or scheduler is not required, and stale stored timestamps must never make an expired break active.
- The frontend provides Start coffee break and End break actions for the currently selected logged-in employee record.
- Disable repeat submissions while an action is pending. Update the displayed state only after a successful response; show a useful error on failure.
- Retrieve break state on page load. Show active status and remaining time while a break is active, and refresh the state at expiry or when returning to the page.
- Browser countdowns are informational; the server is authoritative for active state.
- Break availability survives a backend restart through stored timestamps. A restart does not extend breaks.

### Verification

- Start, retrieve, end, and repeated start/end operations.
- Exactly at expiry and just before/after expiry, using controlled time in tests.
- Unknown, remote, and unassigned-office employees.
- Old database files without break state; persistence and write failures.
- Page reload, failed submissions, and expiration while the page is open.

## Ticket 4 — Match an available coffee buddy

**Type:** Backend and frontend feature  
**Dependency:** Ticket 3

### User story

As an employee on a coffee break, I want to find a colleague in my office who is also on break so we can meet for coffee.

### API

`GET /employees/:id/coffee-buddy`

Keep the specified singular path and return one random eligible colleague. The interface can offer Find another buddy to request another suggestion. A full list can be a future extension.

### Acceptance criteria

- Unknown employee ID returns HTTP `404` with a JSON error.
- The requesting employee must be nonremote, have a nonempty building, and have an active break to receive a suggestion.
- The requesting employee is always excluded from candidates.
- Candidates must be nonremote, have an active break, and share the requesting employee's building.
- Compare building values after trimming whitespace and ignoring letter case. Room and department do not affect eligibility.
- Use one captured server timestamp per matching operation to evaluate all break expirations consistently.
- Randomly choose one eligible colleague, with equal selection probability among candidates.
- Return HTTP `200` with `buddy` containing only `id`, `firstName`, `lastName`, `avatar`, `department`, `building`, and `breakExpiresAt`; set `reason` to `null`.
- No suggestion is a normal outcome. Return HTTP `200` with `buddy: null` and a stable `reason`: `office_unavailable`, `not_on_break`, or `no_available_colleagues`. Check office eligibility before break status.
- Repeated requests may return the same buddy. The frontend action must not promise a different person when only one is available.
- Fetching a suggestion does not start/end a break, reserve a colleague, create an invitation, or modify stored data.
- After successfully starting a break, the frontend requests a suggestion and displays the colleague's profile or the corresponding empty state.
- Provide a refresh action while the requesting employee's break is active. Clear the suggestion when their break ends.
- A suggestion is a snapshot: availability can change afterward. Refresh when the displayed buddy's break expiry is reached; do not promise real-time updates.
- No email, notification, chat, or automatic invitation is sent.

### Verification

- Self-exclusion; different buildings; building case/whitespace normalization.
- Remote employees, missing buildings, expired breaks, and an inactive requesting employee.
- No candidates, one candidate, and several candidates.
- Control randomness in tests to verify selection without relying on flaky statistical assertions.
- Returned profile fields, response reasons, and no writes during GET requests.
- Frontend loading, empty/error states, refresh, and clearing an expired suggestion.

## Completion checklist

- Acceptance criteria and relevant backend/frontend tests pass.
- Build, typecheck, and lint pass.
- Existing `/users` consumers continue working.
- API response shapes and error cases are documented.
- Verify the user flows manually with multiple employees and different break/birthday states.
- No chat, invitation workflow, real-time transport, cross-device popup tracking, or per-user authentication redesign is required by these tickets.
