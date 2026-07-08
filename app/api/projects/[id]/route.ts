import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str, date } from "@/lib/http";
import { PROJECT_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/projects/[id] — full project detail.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      lists: {
        orderBy: { order: "asc" },
        include: {
          tasks: { include: { assignee: true }, orderBy: { order: "asc" } },
          assignees: { include: { member: true } },
        },
      },
      members: { include: { member: true } },
    },
  });
  if (!project) return fail("Project not found", 404);
  return ok(project);
}

// PATCH /api/projects/[id] — update editable project fields.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const data: Record<string, unknown> = {};
  if ("name" in body) {
    const name = str(body.name);
    if (!name) return fail("Project name cannot be empty");
    data.name = name;
  }
  if ("description" in body) data.description = str(body.description) ?? null;
  if ("status" in body) {
    const status = str(body.status);
    if (!status || !PROJECT_STATUSES.includes(status as never)) {
      return fail(`Invalid status: ${status}`);
    }
    data.status = status;
  }
  if ("startDate" in body) data.startDate = date(body.startDate);
  if ("dueDate" in body) data.dueDate = date(body.dueDate);

  try {
    const project = await prisma.project.update({ where: { id }, data });
    return ok(project);
  } catch {
    return fail("Project not found", 404);
  }
}

// DELETE /api/projects/[id] — delete a project and all its nested data.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
    return ok({ deleted: true });
  } catch {
    return fail("Project not found", 404);
  }
}
