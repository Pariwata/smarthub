# smarthub

A lightweight **Work Register & Progress Status Tracker** built with Flask + SQLite.

## Features

- **Work register**: title, description, assignee, status, priority, due date
- **Statuses**: Not started · In progress · Done · Blocked
- **Filtering & search** by status, priority, assignee, or keyword
- **Progress dashboard** with KPIs, completion %, overdue count, and Chart.js breakdowns by status / priority / assignee
- **CSV export & import** for round-trip with spreadsheets
- **Overdue highlighting** for items past their due date

## Quick start

```bash
pip install -r requirements.txt
python app.py
```

Then open <http://localhost:5000>.

The SQLite database is created at `smarthub.db` on first run (override with `SMARTHUB_DB`).

## CSV format

Required column: `title`. Optional columns: `description`, `assignee`, `status`,
`priority`, `due_date` (YYYY-MM-DD). Unknown status/priority values fall back to
defaults.

## Project layout

```
app.py              # Flask app, routes, SQLite access
templates/          # Jinja2 templates (base, index, form, dashboard, import)
static/style.css    # Styles
requirements.txt
```
