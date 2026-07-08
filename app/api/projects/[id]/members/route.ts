import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str } from "@/lib/http";
import { PROJECT_ROLES } from "@/lib/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const COLORS = [
  "#3366ff", "#e0457b", "#0ca678", "#f08c00",
  "#7048e8", "#1098ad", "#e8590c", "#2b8a3e",
];

// POST /api/projects/[id]/members — add a member to a project.
// Body: either { memberId } for an existing person, or { name, email } to
// create a new person and add them. Optional { role }.
export async function POST(req: Request, { params }: Ctx) {
  const { id: projectId } = await params;
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return fail("Project not found", 404);

  const role = str(body.role) ?? "member";
  if (!PROJECT_ROLES.includes(role as never)) {
    return fail(`Invalid role: ${role}`);
  }

  let memberId = str(body.memberId);

  // Create the person on the fly when name/email are provided.
  if (!memberId) {
    const name = str(body.name);
    const email = str(body.email);
    if (!name || !email) {
      return fail("Provide memberId, or name and email to create a member");
    }
    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      memberId = existing.id;
    } else {
      const count = await prisma.member.count();
      const created = await prisma.member.create({
        data: { name, email, avatarColor: COLORS[count % COLORS.length] },
      });
      memberId = created.id;
    }
  }

  const membership = await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId, memberId } },
    create: { projectId, memberId, role },
    update: { role },
    include: { member: true },
  });

  return ok(membership, 201);
}
