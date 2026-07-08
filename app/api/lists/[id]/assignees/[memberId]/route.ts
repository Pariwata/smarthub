import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; memberId: string }> };

// DELETE /api/lists/[id]/assignees/[memberId] — unassign a member from a list.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id: listId, memberId } = await params;
  try {
    await prisma.listAssignee.delete({
      where: { listId_memberId: { listId, memberId } },
    });
    return ok({ deleted: true });
  } catch {
    return fail("Assignment not found", 404);
  }
}
