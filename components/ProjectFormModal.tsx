"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  Field,
  inputClass,
  btnPrimary,
  btnGhost,
} from "./ui";
import { PROJECT_STATUSES, STATUS_LABELS } from "@/lib/types";

type ProjectInit = {
  id?: string;
  name?: string;
  description?: string | null;
  status?: string;
  startDate?: string | null;
  dueDate?: string | null;
};

function toDateInput(v?: string | null) {
  if (!v) return "";
  return new Date(v).toISOString().slice(0, 10);
}

export function ProjectFormModal({
  mode,
  initial = {},
  onClose,
}: {
  mode: "create" | "edit";
  initial?: ProjectInit;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [status, setStatus] = useState(initial.status ?? "active");
  const [startDate, setStartDate] = useState(toDateInput(initial.startDate));
  const [dueDate, setDueDate] = useState(toDateInput(initial.dueDate));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      description,
      status,
      startDate: startDate || null,
      dueDate: dueDate || null,
    };

    const url =
      mode === "create" ? "/api/projects" : `/api/projects/${initial.id}`;
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
    const project = await res.json();
    onClose();
    router.refresh();
    if (mode === "create") router.push(`/projects/${project.id}`);
  }

  return (
    <Modal
      title={mode === "create" ? "New project" : "Edit project"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <Field label="Name">
          <input
            autoFocus
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website redesign"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={inputClass}
            rows={3}
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <Field label="Status">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Start date">
            <input
              type="date"
              className={inputClass}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
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

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
