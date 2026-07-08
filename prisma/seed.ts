import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Reset (dev only) so the seed is idempotent.
  await prisma.task.deleteMany();
  await prisma.listAssignee.deleteMany();
  await prisma.taskList.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.member.deleteMany();

  const people = await Promise.all(
    [
      { name: "Alex Rivera", email: "alex@smarthub.dev", avatarColor: "#3366ff" },
      { name: "Priya Nair", email: "priya@smarthub.dev", avatarColor: "#e0457b" },
      { name: "Marcus Lee", email: "marcus@smarthub.dev", avatarColor: "#0ca678" },
      { name: "Sofia Rossi", email: "sofia@smarthub.dev", avatarColor: "#f08c00" },
      { name: "Dan Kim", email: "dan@smarthub.dev", avatarColor: "#7048e8" },
    ].map((data) => prisma.member.create({ data }))
  );
  const [alex, priya, marcus, sofia, dan] = people;

  // ---- Project 1: Website Redesign ----
  const website = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description:
        "Rebuild the marketing site with a new design system and CMS.",
      status: "active",
      startDate: new Date("2026-06-01"),
      dueDate: new Date("2026-08-15"),
      members: {
        create: [
          { memberId: alex.id, role: "owner" },
          { memberId: priya.id, role: "manager" },
          { memberId: marcus.id, role: "member" },
          { memberId: sofia.id, role: "member" },
        ],
      },
    },
  });

  const design = await prisma.taskList.create({
    data: { name: "Design", order: 0, projectId: website.id },
  });
  const frontend = await prisma.taskList.create({
    data: { name: "Frontend", order: 1, projectId: website.id },
  });
  const content = await prisma.taskList.create({
    data: { name: "Content", order: 2, projectId: website.id },
  });

  await prisma.listAssignee.createMany({
    data: [
      { listId: design.id, memberId: sofia.id },
      { listId: design.id, memberId: priya.id },
      { listId: frontend.id, memberId: alex.id },
      { listId: frontend.id, memberId: marcus.id },
      { listId: content.id, memberId: priya.id },
    ],
  });

  const t = (
    listId: string,
    title: string,
    status: string,
    priority: string,
    assigneeId: string | null,
    order: number
  ) =>
    prisma.task.create({
      data: {
        title,
        status,
        priority,
        assigneeId,
        order,
        listId,
        projectId: website.id,
      },
    });

  await Promise.all([
    t(design.id, "Moodboard & visual direction", "done", "high", sofia.id, 0),
    t(design.id, "Design system tokens", "done", "high", sofia.id, 1),
    t(design.id, "Homepage hi-fi mockups", "in_progress", "high", sofia.id, 2),
    t(design.id, "Pricing page mockups", "todo", "medium", priya.id, 3),

    t(frontend.id, "Set up Next.js + Tailwind", "done", "high", alex.id, 0),
    t(frontend.id, "Build component library", "in_progress", "high", marcus.id, 1),
    t(frontend.id, "Homepage implementation", "in_progress", "urgent", alex.id, 2),
    t(frontend.id, "Responsive QA pass", "todo", "medium", marcus.id, 3),
    t(frontend.id, "Analytics integration", "todo", "low", alex.id, 4),

    t(content.id, "Rewrite homepage copy", "in_progress", "medium", priya.id, 0),
    t(content.id, "Case study interviews", "todo", "medium", priya.id, 1),
  ]);

  // ---- Project 2: Mobile App Launch ----
  const mobile = await prisma.project.create({
    data: {
      name: "Mobile App Launch",
      description: "Ship v1.0 of the iOS & Android apps to the stores.",
      status: "planning",
      startDate: new Date("2026-07-01"),
      dueDate: new Date("2026-10-01"),
      members: {
        create: [
          { memberId: dan.id, role: "owner" },
          { memberId: marcus.id, role: "member" },
        ],
      },
    },
  });

  const backlog = await prisma.taskList.create({
    data: { name: "Backlog", order: 0, projectId: mobile.id },
  });
  const sprint = await prisma.taskList.create({
    data: { name: "Current Sprint", order: 1, projectId: mobile.id },
  });

  await prisma.listAssignee.createMany({
    data: [
      { listId: backlog.id, memberId: dan.id },
      { listId: sprint.id, memberId: dan.id },
      { listId: sprint.id, memberId: marcus.id },
    ],
  });

  await Promise.all([
    prisma.task.create({
      data: { title: "Define MVP scope", status: "done", priority: "high", assigneeId: dan.id, order: 0, listId: sprint.id, projectId: mobile.id },
    }),
    prisma.task.create({
      data: { title: "Auth flow", status: "in_progress", priority: "urgent", assigneeId: marcus.id, order: 1, listId: sprint.id, projectId: mobile.id },
    }),
    prisma.task.create({
      data: { title: "Push notifications", status: "todo", priority: "medium", assigneeId: null, order: 0, listId: backlog.id, projectId: mobile.id },
    }),
    prisma.task.create({
      data: { title: "App store assets", status: "todo", priority: "low", assigneeId: dan.id, order: 1, listId: backlog.id, projectId: mobile.id },
    }),
  ]);

  console.log("Seeded:", {
    members: people.length,
    projects: 2,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
