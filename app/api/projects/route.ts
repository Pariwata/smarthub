import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str, date } from "@/lib/http";
import { computeProgress, PROJECT_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/projects — list all projects with an aggregated progress summary.
export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: { select: { status: true } },
      _count: { select: { members: true, lists: true } },
    },
  });

  const data = projects.map((p) => {
    const { tasks, _count, ...rest } = p;
    return {
      ...rest,
      progress: computeProgress(tasks),
      memberCount: _count.members,
      listCount: _count.lists,
    };
  });

  return ok(data);
}

// POST /api/projects — create a new project.
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const name = str(body.name);
  if (!name) return fail("Project name is required");

  const status = str(body.status) ?? "active";
  if (!PROJECT_STATUSES.includes(status as never)) {
    return fail(`Invalid status: ${status}`);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description: str(body.description) ?? null,
      status,
      startDate: date(body.startDate),
      dueDate: date(body.dueDate),
    },
  });

  return ok(project, 201);
}
