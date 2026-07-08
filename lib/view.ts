import type { Progress } from "./types";

// Serialized (JSON) shapes passed from server components to the client board.

export type MemberVM = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
};

export type TaskVM = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  listId: string;
  projectId: string;
  assigneeId: string | null;
  assignee: MemberVM | null;
};

export type ListVM = {
  id: string;
  name: string;
  order: number;
  projectId: string;
  tasks: TaskVM[];
  assignees: { id: string; memberId: string; member: MemberVM }[];
};

export type ProjectVM = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  lists: ListVM[];
  members: { id: string; memberId: string; role: string; member: MemberVM }[];
};

export type MemberProgressVM = {
  member: MemberVM;
  role: string;
  progress: Progress;
  assignedLists: string[];
};
