import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str } from "@/lib/http";

export const dynamic = "force-dynamic";

// POST /api/lists — create a list (workstream/column) within a project.
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const name = str(body.name);
  if (!name) return fail("List name is required");

  const projectId = str(body.projectId);
  if (!projectId) return fail("projectId is required");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return fail("Project not found", 404);

  const count = await prisma.taskList.count({ where: { projectId } });

  const list = await prisma.taskList.create({
    data: { name, projectId, order: count },
    include: { tasks: { include: { assignee: true } }, assignees: { include: { member: true } } },
  });

  return ok(list, 201);
}
