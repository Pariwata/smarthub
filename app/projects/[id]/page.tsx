import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeProgress } from "@/lib/types";
import { ProjectView } from "@/components/ProjectView";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      lists: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            include: { assignee: true },
          },
          assignees: { include: { member: true } },
        },
      },
      members: {
        include: { member: true },
        orderBy: { member: { name: "asc" } },
      },
    },
  });

  if (!project) notFound();

  // Overall project progress across every task.
  const allTasks = project.lists.flatMap((l) => l.tasks);
  const overall = computeProgress(allTasks);

  // Per-member progress: aggregate over the tasks in the lists that each
  // member is assigned to (their "assigned lists").
  const listsByMember = new Map<string, Set<string>>();
  for (const list of project.lists) {
    for (const a of list.assignees) {
      if (!listsByMember.has(a.memberId)) listsByMember.set(a.memberId, new Set());
      listsByMember.get(a.memberId)!.add(list.id);
    }
  }

  const memberProgress = project.members.map((pm) => {
    const listIds = listsByMember.get(pm.memberId) ?? new Set<string>();
    const tasks = project.lists
      .filter((l) => listIds.has(l.id))
      .flatMap((l) => l.tasks);
    const assignedListNames = project.lists
      .filter((l) => listIds.has(l.id))
      .map((l) => l.name);
    return {
      member: pm.member,
      role: pm.role,
      progress: computeProgress(tasks),
      assignedLists: assignedListNames,
    };
  });

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
      >
        ← All projects
      </Link>
      <ProjectView
        project={JSON.parse(JSON.stringify(project))}
        overall={overall}
        memberProgress={JSON.parse(JSON.stringify(memberProgress))}
      />
    </div>
  );
}
