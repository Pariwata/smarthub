import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeProgress, STATUS_LABELS } from "@/lib/types";
import { ProgressBar, Badge } from "@/components/ui";
import { NewProjectButton } from "@/components/NewProjectButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: { select: { status: true } },
      _count: { select: { members: true, lists: true } },
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            {projects.length} project{projects.length === 1 ? "" : "s"} tracked
          </p>
        </div>
        <NewProjectButton />
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-slate-500">No projects yet.</p>
          <p className="mt-1 text-sm text-slate-400">
            Create your first project to start tracking progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const progress = computeProgress(p.tasks);
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-900 group-hover:text-brand-700">
                    {p.name}
                  </h2>
                  <Badge value={p.status} label={STATUS_LABELS[p.status]} />
                </div>
                <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500">
                  {p.description || "No description"}
                </p>

                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{progress.percent}% complete</span>
                  <span>
                    {progress.done}/{progress.total} done
                  </span>
                </div>
                <ProgressBar
                  done={progress.done}
                  inProgress={progress.inProgress}
                  total={progress.total}
                />

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                  <span>{p._count.members} members</span>
                  <span>{p._count.lists} lists</span>
                  <span>{progress.inProgress} in progress</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
