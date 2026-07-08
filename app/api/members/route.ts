import { prisma } from "@/lib/prisma";
import { ok, fail, readJson, str } from "@/lib/http";

export const dynamic = "force-dynamic";

const COLORS = [
  "#3366ff", "#e0457b", "#0ca678", "#f08c00",
  "#7048e8", "#1098ad", "#e8590c", "#2b8a3e",
];

// GET /api/members — list every person in the system.
export async function GET() {
  const members = await prisma.member.findMany({ orderBy: { name: "asc" } });
  return ok(members);
}

// POST /api/members — create a person.
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body");

  const name = str(body.name);
  if (!name) return fail("Member name is required");

  const email = str(body.email);
  if (!email) return fail("Member email is required");

  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) return fail("A member with that email already exists", 409);

  const count = await prisma.member.count();
  const member = await prisma.member.create({
    data: {
      name,
      email,
      avatarColor: str(body.avatarColor) ?? COLORS[count % COLORS.length],
    },
  });

  return ok(member, 201);
}
