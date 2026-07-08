"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Avatar, btnGhost } from "./ui";
import type { ListVM, MemberVM } from "@/lib/view";

export function ListAssigneesModal({
  list,
  projectMembers,
  onClose,
}: {
  list: ListVM;
  projectMembers: MemberVM[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const assignedIds = new Set(list.assignees.map((a) => a.memberId));

  async function toggle(memberId: string, assigned: boolean) {
    setBusy(memberId);
    if (assigned) {
      await fetch(`/api/lists/${list.id}/assignees/${memberId}`, {
        method: "DELETE",
      });
    } else {
      await fetch(`/api/lists/${list.id}/assignees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
    }
    setBusy(null);
    router.refresh();
  }

  return (
    <Modal title={`Assign members to “${list.name}”`} onClose={onClose}>
      <p className="mb-3 text-sm text-slate-500">
        A member&apos;s dashboard progress is measured across the tasks in the
        lists they are assigned to.
      </p>
      {projectMembers.length === 0 ? (
        <p className="text-sm text-slate-500">
          Add members to the project first.
        </p>
      ) : (
        <ul className="mb-4 divide-y divide-slate-100">
          {projectMembers.map((m) => {
            const assigned = assignedIds.has(m.id);
            return (
              <li key={m.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Avatar name={m.name} color={m.avatarColor} />
                  <span className="text-sm text-slate-700">{m.name}</span>
                </div>
                <button
                  onClick={() => toggle(m.id, assigned)}
                  disabled={busy === m.id}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    assigned
                      ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {assigned ? "Assigned ✓" : "Assign"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex justify-end">
        <button className={btnGhost} onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
