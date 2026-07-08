import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; memberId: string }> };

// DELETE /api/projects/[id]/members/[memberId] — remove a member from a project.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id: projectId, memberId } = await params;
  try {
    await prisma.projectMember.delete({
      where: { projectId_memberId: { projectId, memberId } },
    });
    return ok({ deleted: true });
  } catch {
    return fail("Membership not found", 404);
  }
}
