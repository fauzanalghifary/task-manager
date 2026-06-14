# Mini Task Manager

A small full-stack task manager for creating tasks, moving them through a
fixed workflow, and reviewing an immutable audit history for every status
change.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query
- Backend: Node.js, Express, TypeScript, Zod
- Database: SQLite through `better-sqlite3`
- Testing: Vitest, React Testing Library, Supertest
- Repository: npm workspaces with separate `frontend` and `backend` packages

## Requirements

- Node.js 22 or newer
- npm

The repository includes an `.nvmrc` file:

```bash
nvm use
```

## Installation

Install all workspace dependencies from the repository root:

```bash
npm install
```

## Running The Application

Start the backend in one terminal:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173).

The backend runs at [http://localhost:3000](http://localhost:3000). Vite
proxies frontend requests under `/api` to the backend.

By default, SQLite data is stored in `backend/data/task-manager.db`.

### Environment Variables

The backend supports:

- `PORT`: backend port, defaults to `3000`
- `DATABASE_PATH`: SQLite file path, defaults to `data/task-manager.db`
  relative to the backend workspace

Example:

```bash
DATABASE_PATH=/tmp/task-manager.db PORT=4000 npm run dev:backend
```

## Running Checks

Run the complete test, typecheck, lint, and build suite from the repository
root:

```bash
npm run check
```

Individual root commands are also available:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Workspace-specific commands can still be used for focused checks:

```bash
npm run test -w backend
npm run test -w frontend
npm run prettier:fix -w frontend
```

## Features

- Create a task with the initial status `to_do`
- List active tasks grouped by status
- Move tasks through `to_do -> pending -> in_progress -> done`
- Select the actor responsible for a status change
- View chronological audit history inline per task
- Soft delete tasks while preserving their audit history
- Treat same-status updates as idempotent

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check backend health |
| `GET` | `/api/tasks` | List active tasks |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id/status` | Update task status |
| `GET` | `/api/tasks/:id/audit-logs` | List task audit logs |
| `DELETE` | `/api/tasks/:id` | Soft delete a task |

Create task request:

```json
{
  "title": "Prepare invoice"
}
```

Update status request:

```json
{
  "status": "pending",
  "actor": "john.doe"
}
```

Supported actors are `john.doe`, `jane.smith`, and `alex.lee`.

## Architecture

```text
task-manager/
├── backend/
│   ├── src/
│   │   ├── actors/
│   │   ├── audit-logs/
│   │   ├── database/
│   │   ├── errors/
│   │   ├── health/
│   │   └── tasks/
│   └── tests/
├── frontend/
│   └── src/
│       └── tasks/
├── package.json
└── README.md
```

The backend keeps HTTP concerns separate from business rules and database
access:

- Routes define the available task endpoints.
- Handlers validate request data and return the appropriate HTTP response.
- Services contain the business rules and coordinate operations that involve
  multiple repositories.
- Repositories provide the persistence operations required by the application.
- `createApp` receives a database connection and constructs these
  dependencies. Tests can therefore run the complete API against an in-memory
  SQLite database.

The frontend separates data fetching from presentation:

- `TasksSection` coordinates task queries, mutations, and actor selection.
- `TaskList` groups tasks by their current status.
- `TaskItem` renders one task, its actions, and the history toggle.
- `TaskAuditLog` fetches a task's history only after the user opens it.
- `task-api.ts` contains the HTTP requests used by the React components.

## Data Consistency And Concurrency

A status update and its audit-log insert run inside one SQLite
`IMMEDIATE` transaction. If either operation fails, both are rolled back.

The update query also includes the previously read status in its `WHERE`
clause. This acts as an optimistic concurrency check. A concurrent request
that loses the race cannot silently overwrite a newer status.

SQLite is configured with:

- Write-ahead logging (`WAL`)
- Foreign-key enforcement
- A 5-second busy timeout

For two concurrent identical status requests, one request performs the
transition and creates one audit row. The second observes the new status and
returns an idempotent result without adding another row.

## Assumptions

- Authentication and authorization are outside this task's scope.
- Actors come from a small predefined list. The frontend mirrors this list for
  display, while the backend remains responsible for validation.
- Only status changes create audit logs. Task creation and deletion do not.
- Deleting a task means hiding it from active task lists, not physically
deleting its database row.
- Audit timestamps are stored as UTC ISO strings and displayed using the
  browser's local timezone.
- Status transitions only move forward by one step.

## Trade-Offs

### SQLite Instead Of PostgreSQL

SQLite keeps setup small and makes the repository easy to run. 
Transactions, constraints, triggers, and WAL are sufficient for the
expected workload.

The trade-off is limited write concurrency and a single database file. For
multiple application instances or sustained concurrent writes, PostgreSQL
would be a better fit.

### No ORM Or Migration Framework

The schema and SQL are intentionally explicit. This reduces dependencies and
makes consistency rules easy to inspect. The cost is that schema evolution
would become harder as the application grows.

### Predefined Actors Without Authentication

This demonstrates actor attribution without adding an unrelated authentication
system. It does not prove that the selected actor is the person making the
request.

## How Audit Logs Are Kept Immutable

Audit logs are protected at multiple levels:

1. The application exposes no audit-log update or delete endpoint.
2. The repository only supports inserting and reading audit logs.
3. SQLite triggers reject every `UPDATE` and `DELETE` on `audit_logs`.
4. A foreign key with `ON DELETE RESTRICT` prevents physical task deletion
   from removing history.
5. Tasks are soft deleted, so their audit logs remain available.

## Highest Risk With Many Users

- **Write contention:** SQLite serializes writes, so many simultaneous status
  changes would increase lock waits and may eventually exceed the busy
  timeout.
- **Actor spoofing:** There is no authentication, so a client can submit any
  actor accepted by the backend.

**Mitigations:**
- Move persistence to PostgreSQL to support higher write concurrency.
- Derive the actor from authenticated server-side context to prevent spoofing.

## First Refactoring Priority For A Larger System

- **Priority:** Refactor the persistence layer first.
  - **Reason:** SQLite is appropriate for this take-home task, but it would
    become the main constraint as write volume and the number of application
    instances increase.
  - **Approach:** Introduce versioned migrations, move the data to PostgreSQL,
    and replace the repository implementations while keeping the service-level
    business rules unchanged.
  - **Benefit:** This limits the scope of the change while improving support for
    concurrent writes, operational tooling, and horizontal scaling.

## What I Would Improve With More Time

- Add clearer mutation error messages and retry actions in the UI
- Add delete confirmation or undo
- Add pagination for tasks and long audit histories
- Add end-to-end browser tests for the main workflow
- Add database migrations and production build/deployment configuration
- Share generated API types between frontend and backend

## AI Usage

- Discussing stack and architecture trade-offs
- Scaffolding and refining React and Express code
- Writing test cases
- Implementing planned features
- Drafting this README

Every change was reviewed against the requirements and existing code. The
solution was validated through: 
- Backend integration tests, 
- Frontend component tests, 
- TypeScript checks, 
- Linting, 
- Production builds, and 
- Manual browser verification of the main workflows.
