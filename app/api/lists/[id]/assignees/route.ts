import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/lists/[id]/assignees — assign a member to a list.
// Body: { memberId }
export async function POST(req: Request, { params }: Ctx) {
  const { id: listId } = await params;
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const memberId = str(body.memberId);
  if (!memberId) return fail("memberId is required");

  const list = await prisma.taskList.findUnique({ where: { id: listId } });
  if (!list) return fail("List not found", 404);

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return fail("Member not found", 404);

  const assignee = await prisma.listAssignee.upsert({
    where: { listId_memberId: { listId, memberId } },
    create: { listId, memberId },
    update: {},
    include: { member: true },
  });

  return ok(assignee, 201);
}
