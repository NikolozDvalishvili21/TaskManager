export type TaskStatus = "todo" | "in_progress" | "testing" | "done";

export type TaskPriority = "low" | "medium" | "high";

export type UserRole = "admin" | "pm" | "viewer";

export interface Assignee {
  uid: string;
  displayName: string;
  photoURL: string | null;
  email: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  imageUrls: string[];
  userId: string;
  assignee: Assignee | null;
}

export interface Comment {
  id: string;
  text: string;
  authorName: string;
  authorPhoto: string;
  authorId: string;
  createdAt: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface TeamMember {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role?: UserRole;
}

export interface Column {
  id: TaskStatus;
  title: string;
}

export const COLUMNS: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "testing", title: "Testing" },
  { id: "done", title: "Done" },
];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  testing: "Testing",
  done: "Done",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  pm: "Project Manager",
  viewer: "Viewer",
};
