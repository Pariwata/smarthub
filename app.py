import csv
import io
import os
import sqlite3
from datetime import datetime, date
from flask import (
    Flask, g, render_template, request, redirect, url_for,
    flash, Response, abort,
)

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("SMARTHUB_DB", os.path.join(APP_DIR, "smarthub.db"))

STATUSES = ["Not started", "In progress", "Done", "Blocked"]
PRIORITIES = ["High", "Medium", "Low"]

app = Flask(__name__)
app.secret_key = os.environ.get("SMARTHUB_SECRET", "dev-secret-change-me")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            assignee TEXT,
            status TEXT NOT NULL DEFAULT 'Not started',
            priority TEXT NOT NULL DEFAULT 'Medium',
            due_date TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def parse_date(value):
    if not value:
        return None
    try:
        datetime.strptime(value, "%Y-%m-%d")
        return value
    except ValueError:
        return None


def entry_from_form(form):
    title = (form.get("title") or "").strip()
    if not title:
        raise ValueError("Title is required.")
    status = form.get("status") or "Not started"
    if status not in STATUSES:
        status = "Not started"
    priority = form.get("priority") or "Medium"
    if priority not in PRIORITIES:
        priority = "Medium"
    return {
        "title": title,
        "description": (form.get("description") or "").strip(),
        "assignee": (form.get("assignee") or "").strip(),
        "status": status,
        "priority": priority,
        "due_date": parse_date(form.get("due_date")),
    }


@app.template_filter("status_class")
def status_class(value):
    return {
        "Not started": "status-notstarted",
        "In progress": "status-inprogress",
        "Done": "status-done",
        "Blocked": "status-blocked",
    }.get(value, "")


@app.template_filter("priority_class")
def priority_class(value):
    return {
        "High": "priority-high",
        "Medium": "priority-medium",
        "Low": "priority-low",
    }.get(value, "")


@app.template_filter("is_overdue")
def is_overdue(entry):
    if not entry["due_date"] or entry["status"] == "Done":
        return False
    try:
        d = datetime.strptime(entry["due_date"], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return False
    return d < date.today()


@app.route("/")
def index():
    db = get_db()
    q = (request.args.get("q") or "").strip()
    status = request.args.get("status") or ""
    assignee = request.args.get("assignee") or ""
    priority = request.args.get("priority") or ""

    sql = "SELECT * FROM entries WHERE 1=1"
    params = []
    if q:
        sql += " AND (title LIKE ? OR description LIKE ?)"
        like = f"%{q}%"
        params.extend([like, like])
    if status:
        sql += " AND status = ?"
        params.append(status)
    if assignee:
        sql += " AND assignee = ?"
        params.append(assignee)
    if priority:
        sql += " AND priority = ?"
        params.append(priority)
    sql += """
        ORDER BY
            CASE status
                WHEN 'In progress' THEN 0
                WHEN 'Blocked' THEN 1
                WHEN 'Not started' THEN 2
                WHEN 'Done' THEN 3
            END,
            CASE priority
                WHEN 'High' THEN 0
                WHEN 'Medium' THEN 1
                WHEN 'Low' THEN 2
            END,
            (due_date IS NULL), due_date ASC,
            id DESC
    """
    entries = db.execute(sql, params).fetchall()
    assignees = [
        row["assignee"]
        for row in db.execute(
            "SELECT DISTINCT assignee FROM entries WHERE assignee IS NOT NULL AND assignee != '' ORDER BY assignee"
        ).fetchall()
    ]

    return render_template(
        "index.html",
        entries=entries,
        statuses=STATUSES,
        priorities=PRIORITIES,
        assignees=assignees,
        filters={"q": q, "status": status, "assignee": assignee, "priority": priority},
    )


@app.route("/new", methods=["GET", "POST"])
def new_entry():
    if request.method == "POST":
        try:
            data = entry_from_form(request.form)
        except ValueError as e:
            flash(str(e), "error")
            return render_template(
                "form.html",
                entry=request.form,
                statuses=STATUSES,
                priorities=PRIORITIES,
                action_url=url_for("new_entry"),
                heading="New work item",
            )
        now = datetime.utcnow().isoformat(timespec="seconds")
        db = get_db()
        db.execute(
            """
            INSERT INTO entries
                (title, description, assignee, status, priority, due_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["title"], data["description"], data["assignee"],
                data["status"], data["priority"], data["due_date"], now, now,
            ),
        )
        db.commit()
        flash("Work item created.", "success")
        return redirect(url_for("index"))

    return render_template(
        "form.html",
        entry={"status": "Not started", "priority": "Medium"},
        statuses=STATUSES,
        priorities=PRIORITIES,
        action_url=url_for("new_entry"),
        heading="New work item",
    )


@app.route("/<int:entry_id>/edit", methods=["GET", "POST"])
def edit_entry(entry_id):
    db = get_db()
    entry = db.execute("SELECT * FROM entries WHERE id = ?", (entry_id,)).fetchone()
    if not entry:
        abort(404)

    if request.method == "POST":
        try:
            data = entry_from_form(request.form)
        except ValueError as e:
            flash(str(e), "error")
            return render_template(
                "form.html",
                entry=request.form,
                statuses=STATUSES,
                priorities=PRIORITIES,
                action_url=url_for("edit_entry", entry_id=entry_id),
                heading=f"Edit #{entry_id}",
            )
        now = datetime.utcnow().isoformat(timespec="seconds")
        db.execute(
            """
            UPDATE entries SET
                title = ?, description = ?, assignee = ?,
                status = ?, priority = ?, due_date = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                data["title"], data["description"], data["assignee"],
                data["status"], data["priority"], data["due_date"], now, entry_id,
            ),
        )
        db.commit()
        flash("Work item updated.", "success")
        return redirect(url_for("index"))

    return render_template(
        "form.html",
        entry=entry,
        statuses=STATUSES,
        priorities=PRIORITIES,
        action_url=url_for("edit_entry", entry_id=entry_id),
        heading=f"Edit #{entry_id}",
    )


@app.route("/<int:entry_id>/delete", methods=["POST"])
def delete_entry(entry_id):
    db = get_db()
    db.execute("DELETE FROM entries WHERE id = ?", (entry_id,))
    db.commit()
    flash("Work item deleted.", "success")
    return redirect(url_for("index"))


@app.route("/dashboard")
def dashboard():
    db = get_db()
    total = db.execute("SELECT COUNT(*) AS c FROM entries").fetchone()["c"]

    status_counts = {s: 0 for s in STATUSES}
    for row in db.execute("SELECT status, COUNT(*) AS c FROM entries GROUP BY status"):
        if row["status"] in status_counts:
            status_counts[row["status"]] = row["c"]

    priority_counts = {p: 0 for p in PRIORITIES}
    for row in db.execute("SELECT priority, COUNT(*) AS c FROM entries GROUP BY priority"):
        if row["priority"] in priority_counts:
            priority_counts[row["priority"]] = row["c"]

    assignee_rows = db.execute(
        """
        SELECT COALESCE(NULLIF(assignee, ''), 'Unassigned') AS assignee, COUNT(*) AS c
        FROM entries GROUP BY assignee ORDER BY c DESC LIMIT 10
        """
    ).fetchall()

    today = date.today().isoformat()
    overdue = db.execute(
        "SELECT COUNT(*) AS c FROM entries WHERE due_date IS NOT NULL AND due_date < ? AND status != 'Done'",
        (today,),
    ).fetchone()["c"]

    done = status_counts["Done"]
    completion = round((done / total) * 100, 1) if total else 0.0

    return render_template(
        "dashboard.html",
        total=total,
        completion=completion,
        overdue=overdue,
        status_counts=status_counts,
        priority_counts=priority_counts,
        assignee_data=[(r["assignee"], r["c"]) for r in assignee_rows],
    )


CSV_COLUMNS = ["id", "title", "description", "assignee", "status", "priority", "due_date", "created_at", "updated_at"]


@app.route("/export.csv")
def export_csv():
    db = get_db()
    rows = db.execute(f"SELECT {', '.join(CSV_COLUMNS)} FROM entries ORDER BY id").fetchall()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(CSV_COLUMNS)
    for r in rows:
        writer.writerow([r[c] if r[c] is not None else "" for c in CSV_COLUMNS])
    return Response(
        buf.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=work_register.csv"},
    )


@app.route("/import", methods=["GET", "POST"])
def import_csv():
    if request.method == "POST":
        file = request.files.get("file")
        if not file or not file.filename:
            flash("Please choose a CSV file.", "error")
            return redirect(url_for("import_csv"))
        try:
            text = file.stream.read().decode("utf-8-sig")
        except UnicodeDecodeError:
            flash("File must be UTF-8 encoded CSV.", "error")
            return redirect(url_for("import_csv"))

        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames or "title" not in [h.strip().lower() for h in reader.fieldnames]:
            flash("CSV must include a 'title' column.", "error")
            return redirect(url_for("import_csv"))

        headers = [h.strip().lower() for h in reader.fieldnames]
        normalized = []
        for raw in reader:
            row = {headers[i]: (v or "").strip() for i, (k, v) in enumerate(raw.items())}
            normalized.append(row)

        db = get_db()
        now = datetime.utcnow().isoformat(timespec="seconds")
        inserted = 0
        skipped = 0
        for row in normalized:
            title = row.get("title", "")
            if not title:
                skipped += 1
                continue
            status = row.get("status") or "Not started"
            if status not in STATUSES:
                status = "Not started"
            priority = row.get("priority") or "Medium"
            if priority not in PRIORITIES:
                priority = "Medium"
            db.execute(
                """
                INSERT INTO entries
                    (title, description, assignee, status, priority, due_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    title,
                    row.get("description", ""),
                    row.get("assignee", ""),
                    status,
                    priority,
                    parse_date(row.get("due_date")),
                    now,
                    now,
                ),
            )
            inserted += 1
        db.commit()
        flash(f"Imported {inserted} item(s). Skipped {skipped}.", "success")
        return redirect(url_for("index"))

    return render_template("import.html")


with app.app_context():
    init_db()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=True)
