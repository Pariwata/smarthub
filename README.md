# SmartHub — Project Tracking Web App

A full-stack project-tracking dashboard. Track projects, task progress, and
per-member workload in one place.

## Features

- **Project dashboard** (`/`) — every project as a card with a live progress
  bar, completion %, and member/list counts.
- **Project detail** (`/projects/[id]`) — the main tracking view:
  - **Progress overview** — total / to-do / in-progress / done tasks and an
    overall completion bar for the project.
  - **Team progress** — each member with a progress bar showing tasks
    **done** and **in progress** out of the **total** tasks in the lists they
    are assigned to.
  - **Task board** — lists (columns) of task cards. Change a task's status
    inline, or open a task to edit priority, assignee, due date, etc.
- **Create / edit / delete** at both the **project** level and the **task**
  level, plus lists, members, and list assignments — all from the UI.
- **REST API** backing every action.

## Tech stack

| Layer     | Choice                                    |
| --------- | ----------------------------------------- |
| Framework | Next.js 15 (App Router, React 19)         |
| Language  | TypeScript                                |
| Styling   | Tailwind CSS                              |
| Database  | SQLite via Prisma ORM                      |

## Data model

Standard project-management structure (see `prisma/schema.prisma`):

```
Project --< TaskList --< Task
   |            |            \- assignee -> Member (optional)
   |            \-< ListAssignee >-- Member   (who works on this list)
   \-< ProjectMember >-- Member                (membership + role)
```

- **Project** — name, description, status (`planning/active/on_hold/completed/archived`), start & due dates.
- **TaskList** — an ordered list/column/workstream within a project.
- **Task** — title, description, status (`todo/in_progress/done`), priority
  (`low/medium/high/urgent`), optional assignee and due date.
- **Member** — a person (name, email, avatar color).
- **ProjectMember** — a member's role on a project (`owner/manager/member/viewer`).
- **ListAssignee** — which members are assigned to a list. A member's dashboard
  progress is aggregated over the tasks in the lists they're assigned to.

## Getting started

```bash
npm install            # install dependencies
npm run db:push        # create the SQLite database from the schema
npm run db:seed        # load demo projects, members, and tasks
npm run dev            # start the dev server at http://localhost:3000
```

Useful scripts:

- `npm run build` — production build (runs `prisma generate` first).
- `npm run db:reset` — wipe and re-seed the database.

The database connection string lives in `.env` (`DATABASE_URL="file:./dev.db"`).

## API reference

| Method   | Route                                        | Description                       |
| -------- | -------------------------------------------- | --------------------------------- |
| `GET`    | `/api/projects`                              | List projects with progress       |
| `POST`   | `/api/projects`                              | Create a project                  |
| `GET`    | `/api/projects/:id`                          | Full project detail               |
| `PATCH`  | `/api/projects/:id`                          | Update a project                  |
| `DELETE` | `/api/projects/:id`                          | Delete a project (cascades)       |
| `POST`   | `/api/projects/:id/members`                  | Add a member (existing or new)    |
| `DELETE` | `/api/projects/:id/members/:memberId`        | Remove a member from a project    |
| `GET`    | `/api/members`                               | List all people                   |
| `POST`   | `/api/members`                               | Create a person                   |
| `POST`   | `/api/lists`                                 | Create a list                     |
| `PATCH`  | `/api/lists/:id`                             | Rename / reorder a list           |
| `DELETE` | `/api/lists/:id`                             | Delete a list (cascades)          |
| `POST`   | `/api/lists/:id/assignees`                   | Assign a member to a list         |
| `DELETE` | `/api/lists/:id/assignees/:memberId`         | Unassign a member from a list     |
| `POST`   | `/api/tasks`                                 | Create a task                     |
| `PATCH`  | `/api/tasks/:id`                             | Update a task                     |
| `DELETE` | `/api/tasks/:id`                             | Delete a task                     |
