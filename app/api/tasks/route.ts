import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str, date } from "@/lib/http";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/types";

export const dynamic = "force-dynamic";

// POST /api/tasks — create a task inside a list.
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const title = str(body.title);
  if (!title) return fail("Task title is required");

  const listId = str(body.listId);
  if (!listId) return fail("listId is required");

  const list = await prisma.taskList.findUnique({ where: { id: listId } });
  if (!list) return fail("List not found", 404);

  const status = str(body.status) ?? "todo";
  if (!TASK_STATUSES.includes(status as never)) {
    return fail(`Invalid status: ${status}`);
  }
  const priority = str(body.priority) ?? "medium";
  if (!TASK_PRIORITIES.includes(priority as never)) {
    return fail(`Invalid priority: ${priority}`);
  }

  const count = await prisma.task.count({ where: { listId } });

  const task = await prisma.task.create({
    data: {
      title,
      description: str(body.description) ?? null,
      status,
      priority,
      dueDate: date(body.dueDate),
      listId,
      projectId: list.projectId,
      assigneeId: str(body.assigneeId) ?? null,
      order: count,
    },
    include: { assignee: true },
  });

  return ok(task, 201);
}
