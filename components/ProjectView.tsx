"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProgressBar,
  Avatar,
  Badge,
  btnPrimary,
  btnGhost,
  inputClass,
} from "./ui";
import { ProjectFormModal } from "./ProjectFormModal";
import { TaskModal } from "./TaskModal";
import { AddMemberModal } from "./AddMemberModal";
import { ListAssigneesModal } from "./ListAssigneesModal";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  type Progress,
} from "@/lib/types";
import type {
  ListVM,
  MemberVM,
  MemberProgressVM,
  ProjectVM,
  TaskVM,
} from "@/lib/view";

function fmtDate(v: string | null) {
  if (!v) return null;
  return new Date(v).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A single stat tile in the overview row. */
function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className={`text-2xl font-semibold ${tone}`}>{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
    </div>
  );
}

export function ProjectView({
  project,
  overall,
  memberProgress,
}: {
  project: ProjectVM;
  overall: Progress;
  memberProgress: MemberProgressVM[];
}) {
  const router = useRouter();
  const projectMembers: MemberVM[] = project.members.map((m) => m.member);

  const [editProject, setEditProject] = useState(false);
  const [addMember, setAddMember] = useState(false);
  const [assignList, setAssignList] = useState<ListVM | null>(null);
  const [taskCtx, setTaskCtx] = useState<
    | { mode: "create"; list: ListVM }
    | { mode: "edit"; list: ListVM; task: TaskVM }
    | null
  >(null);
  const [newListName, setNewListName] = useState("");
  const [addingList, setAddingList] = useState(false);

  async function deleteProject() {
    if (!confirm("Delete this project and all its tasks? This cannot be undone."))
      return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  async function quickStatus(task: TaskVM, status: string) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim()) return;
    setAddingList(true);
    await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newListName, projectId: project.id }),
    });
    setNewListName("");
    setAddingList(false);
    router.refresh();
  }

  async function deleteList(list: ListVM) {
    if (!confirm(`Delete list “${list.name}” and its tasks?`)) return;
    await fetch(`/api/lists/${list.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member from the project?")) return;
    await fetch(`/api/projects/${project.id}/members/${memberId}`, {
      method: "DELETE",
    });
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              {project.name}
            </h1>
            <Badge value={project.status} label={STATUS_LABELS[project.status]} />
          </div>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {project.description}
            </p>
          )}
          <div className="mt-2 flex gap-4 text-xs text-slate-400">
            {fmtDate(project.startDate) && (
              <span>Start: {fmtDate(project.startDate)}</span>
            )}
            {fmtDate(project.dueDate) && (
              <span>Due: {fmtDate(project.dueDate)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={() => setEditProject(true)}>
            Edit project
          </button>
          <button
            className="inline-flex items-center rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            onClick={deleteProject}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Overview */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Progress overview</h2>
          <span className="text-sm font-medium text-slate-500">
            {overall.percent}% complete
          </span>
        </div>
        <ProgressBar
          done={overall.done}
          inProgress={overall.inProgress}
          total={overall.total}
          className="mb-5 h-3"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total tasks" value={overall.total} tone="text-slate-900" />
          <Stat label="To do" value={overall.todo} tone="text-slate-500" />
          <Stat label="In progress" value={overall.inProgress} tone="text-amber-600" />
          <Stat label="Done" value={overall.done} tone="text-emerald-600" />
        </div>
      </section>

      {/* Team progress */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Team progress{" "}
            <span className="text-sm font-normal text-slate-400">
              ({memberProgress.length})
            </span>
          </h2>
          <button className={btnGhost} onClick={() => setAddMember(true)}>
            + Add member
          </button>
        </div>

        {memberProgress.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
            No members yet. Add teammates and assign them to lists to track
            their workload.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {memberProgress.map((mp) => (
              <div
                key={mp.member.id}
                className="group rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={mp.member.name}
                      color={mp.member.avatarColor}
                      size={36}
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {mp.member.name}
                      </div>
                      <div className="text-xs capitalize text-slate-400">
                        {mp.role}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(mp.member.id)}
                    className="text-xs text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
                    title="Remove from project"
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{mp.progress.percent}% done</span>
                  <span>
                    {mp.progress.done} done · {mp.progress.inProgress} in progress
                    · {mp.progress.total} total
                  </span>
                </div>
                <ProgressBar
                  done={mp.progress.done}
                  inProgress={mp.progress.inProgress}
                  total={mp.progress.total}
                />
                <div className="mt-2 text-xs text-slate-400">
                  {mp.assignedLists.length > 0
                    ? `Lists: ${mp.assignedLists.join(", ")}`
                    : "No lists assigned"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Board */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Task board</h2>
          <form onSubmit={createList} className="flex gap-2">
            <input
              className={inputClass + " w-44"}
              placeholder="New list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <button className={btnPrimary} disabled={addingList}>
              + List
            </button>
          </form>
        </div>

        {project.lists.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
            No lists yet. Create a list (e.g. “Backlog”, “In Progress”, “Done”)
            to start adding tasks.
          </div>
        ) : (
          <div className="scroll-thin flex gap-4 overflow-x-auto pb-4">
            {project.lists.map((list) => {
              const done = list.tasks.filter((t) => t.status === "done").length;
              return (
                <div
                  key={list.id}
                  className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-100/60"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {list.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {done}/{list.tasks.length} done
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAssignList(list)}
                        className="rounded p-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        title="Assign members"
                      >
                        👥
                      </button>
                      <button
                        onClick={() => deleteList(list)}
                        className="rounded p-1 text-xs text-slate-400 hover:bg-slate-200 hover:text-rose-500"
                        title="Delete list"
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {list.assignees.length > 0 && (
                    <div className="flex items-center gap-1 px-4 pt-2">
                      {list.assignees.map((a) => (
                        <Avatar
                          key={a.id}
                          name={a.member.name}
                          color={a.member.avatarColor}
                          size={22}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 p-3">
                    {list.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() =>
                              setTaskCtx({ mode: "edit", list, task })
                            }
                            className="text-left text-sm font-medium text-slate-800 hover:text-brand-600"
                          >
                            {task.title}
                          </button>
                          <Badge
                            value={task.priority}
                            label={PRIORITY_LABELS[task.priority as never]}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <select
                            value={task.status}
                            onChange={(e) => quickStatus(task, e.target.value)}
                            className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-600"
                          >
                            <option value="todo">To do</option>
                            <option value="in_progress">In progress</option>
                            <option value="done">Done</option>
                          </select>
                          {task.assignee ? (
                            <Avatar
                              name={task.assignee.name}
                              color={task.assignee.avatarColor}
                              size={22}
                            />
                          ) : (
                            <span className="text-xs text-slate-300">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => setTaskCtx({ mode: "create", list })}
                      className="rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-brand-300 hover:text-brand-600"
                    >
                      + Add task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modals */}
      {editProject && (
        <ProjectFormModal
          mode="edit"
          initial={project}
          onClose={() => setEditProject(false)}
        />
      )}
      {addMember && (
        <AddMemberModal
          projectId={project.id}
          existingMemberIds={projectMembers.map((m) => m.id)}
          onClose={() => setAddMember(false)}
        />
      )}
      {assignList && (
        <ListAssigneesModal
          list={assignList}
          projectMembers={projectMembers}
          onClose={() => setAssignList(null)}
        />
      )}
      {taskCtx && (
        <TaskModal
          mode={taskCtx.mode}
          list={taskCtx.list}
          members={projectMembers}
          task={taskCtx.mode === "edit" ? taskCtx.task : undefined}
          onClose={() => setTaskCtx(null)}
        />
      )}
    </div>
  );
}
