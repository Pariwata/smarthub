import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str, date } from "@/lib/http";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/tasks/[id] — update task fields (status, assignee, etc.).
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const data: Record<string, unknown> = {};

  if ("title" in body) {
    const title = str(body.title);
    if (!title) return fail("Task title cannot be empty");
    data.title = title;
  }
  if ("description" in body) data.description = str(body.description) ?? null;
  if ("status" in body) {
    const status = str(body.status);
    if (!status || !TASK_STATUSES.includes(status as never)) {
      return fail(`Invalid status: ${status}`);
    }
    data.status = status;
  }
  if ("priority" in body) {
    const priority = str(body.priority);
    if (!priority || !TASK_PRIORITIES.includes(priority as never)) {
      return fail(`Invalid priority: ${priority}`);
    }
    data.priority = priority;
  }
  if ("dueDate" in body) data.dueDate = date(body.dueDate);
  if ("assigneeId" in body) data.assigneeId = str(body.assigneeId) ?? null;
  if ("listId" in body) {
    const listId = str(body.listId);
    if (!listId) return fail("listId cannot be empty");
    const list = await prisma.taskList.findUnique({ where: { id: listId } });
    if (!list) return fail("List not found", 404);
    data.listId = listId;
    data.projectId = list.projectId;
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data,
      include: { assignee: true },
    });
    return ok(task);
  } catch {
    return fail("Task not found", 404);
  }
}

// DELETE /api/tasks/[id] — remove a task.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.task.delete({ where: { id } });
    return ok({ deleted: true });
  } catch {
    return fail("Task not found", 404);
  }
}
