"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Field, inputClass, btnPrimary, btnGhost } from "./ui";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/lib/types";
import type { ListVM, MemberVM, TaskVM } from "@/lib/view";

function toDateInput(v?: string | null) {
  return v ? new Date(v).toISOString().slice(0, 10) : "";
}

export function TaskModal({
  mode,
  list,
  members,
  task,
  onClose,
}: {
  mode: "create" | "edit";
  list: ListVM;
  members: MemberVM[];
  task?: TaskVM;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? "todo");
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? "");
  const [dueDate, setDueDate] = useState(toDateInput(task?.dueDate));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      description,
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      listId: list.id,
    };
    const url = mode === "create" ? "/api/tasks" : `/api/tasks/${task!.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      return;
    }
    onClose();
    router.refresh();
  }

  async function remove() {
    if (!task) return;
    if (!confirm("Delete this task?")) return;
    setSaving(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <Modal
      title={mode === "create" ? `Add task to “${list.name}”` : "Edit task"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <Field label="Title">
          <input
            autoFocus
            required
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Design the landing hero"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Status">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              className={inputClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignee">
            <select
              className={inputClass}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due date">
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
        </div>

        {error && (
          <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          {mode === "edit" ? (
            <button
              type="button"
              onClick={remove}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Delete task
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className={btnGhost} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Add task" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
