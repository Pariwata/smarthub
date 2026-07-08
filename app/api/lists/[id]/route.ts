import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str } from "@/lib/http";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/lists/[id] — rename a list.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const data: Record<string, unknown> = {};
  if ("name" in body) {
    const name = str(body.name);
    if (!name) return fail("List name cannot be empty");
    data.name = name;
  }
  if ("order" in body && typeof body.order === "number") data.order = body.order;

  try {
    const list = await prisma.taskList.update({ where: { id }, data });
    return ok(list);
  } catch {
    return fail("List not found", 404);
  }
}

// DELETE /api/lists/[id] — delete a list and its tasks.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.taskList.delete({ where: { id } });
    return ok({ deleted: true });
  } catch {
    return fail("List not found", 404);
  }
}
