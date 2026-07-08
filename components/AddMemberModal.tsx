"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Field, inputClass, btnPrimary, btnGhost } from "./ui";
import { PROJECT_ROLES } from "@/lib/types";
import type { MemberVM } from "@/lib/view";

export function AddMemberModal({
  projectId,
  existingMemberIds,
  onClose,
}: {
  projectId: string;
  existingMemberIds: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"existing" | "new">("existing");
  const [allMembers, setAllMembers] = useState<MemberVM[]>([]);
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((data: MemberVM[]) => {
        const available = data.filter((m) => !existingMemberIds.includes(m.id));
        setAllMembers(available);
        if (available.length === 0) setTab("new");
        else setMemberId(available[0].id);
      })
      .catch(() => setAllMembers([]));
  }, [existingMemberIds]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload =
      tab === "existing" ? { memberId, role } : { name, email, role };

    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
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

  return (
    <Modal title="Add team member" onClose={onClose}>
      <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setTab("existing")}
          className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
            tab === "existing" ? "bg-white shadow-sm" : "text-slate-500"
          }`}
        >
          Existing person
        </button>
        <button
          type="button"
          onClick={() => setTab("new")}
          className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
            tab === "new" ? "bg-white shadow-sm" : "text-slate-500"
          }`}
        >
          New person
        </button>
      </div>

      <form onSubmit={submit}>
        {tab === "existing" ? (
          <Field label="Person">
            {allMembers.length === 0 ? (
              <p className="text-sm text-slate-500">
                Everyone is already on this project. Add a new person instead.
              </p>
            ) : (
              <select
                className={inputClass}
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              >
                {allMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : (
          <>
            <Field label="Name">
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                required
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                required
              />
            </Field>
          </>
        )}

        <Field label="Project role">
          <select
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {PROJECT_ROLES.map((r) => (
              <option key={r} value={r}>
                {r[0].toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </Field>

        {error && (
          <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className={btnPrimary}
            disabled={saving || (tab === "existing" && allMembers.length === 0)}
          >
            {saving ? "Adding…" : "Add member"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
