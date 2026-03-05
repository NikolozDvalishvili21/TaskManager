import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Task, TaskStatus, TaskPriority, Assignee } from "../../types";

// Root-level tasks collection for shared access
const tasksRef = collection(db, "tasks");

const getTaskDocRef = (taskId: string) => doc(db, "tasks", taskId);

export interface CreateTaskData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  assignee: Assignee | null;
  assignedBy?: Assignee | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
  imageUrls?: string[];
  assignee?: Assignee | null;
  assignedBy?: Assignee | null;
}

function convertTimestamp(timestamp: Timestamp | null): string {
  if (!timestamp) return new Date().toISOString();
  return timestamp.toDate().toISOString();
}

function docToTask(docSnapshot: {
  id: string;
  data: () => Record<string, unknown>;
}): Task {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    title: data.title as string,
    description: data.description as string,
    status: data.status as TaskStatus,
    priority: data.priority as TaskPriority,
    dueDate: (data.dueDate as string) || null,
    tags: (data.tags as string[]) || [],
    createdAt: convertTimestamp(data.createdAt as Timestamp | null),
    updatedAt: convertTimestamp(data.updatedAt as Timestamp | null),
    imageUrls: (data.imageUrls as string[]) || [],
    userId: data.ownerId as string,
    assignee: (data.assignee as Assignee) || null,
    assignedBy: (data.assignedBy as Assignee) || null,
  };
}

// Get tasks where user is owner
export async function getOwnedTasks(userId: string): Promise<Task[]> {
  const q = query(
    tasksRef,
    where("ownerId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToTask);
}

// Get tasks where user is assignee
export async function getAssignedTasks(userId: string): Promise<Task[]> {
  const q = query(
    tasksRef,
    where("assignee.uid", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToTask);
}

// Subscribe to tasks where user is owner
export function subscribeToOwnedTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
): Unsubscribe {
  const q = query(
    tasksRef,
    where("ownerId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(docToTask);
    callback(tasks);
  });
}

// Subscribe to tasks where user is assignee
export function subscribeToAssignedTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
): Unsubscribe {
  const q = query(
    tasksRef,
    where("assignee.uid", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(docToTask);
    callback(tasks);
  });
}

// Combined subscription for all user's tasks (owned + assigned)
export function subscribeToUserTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
): Unsubscribe {
  let ownedTasks: Task[] = [];
  let assignedTasks: Task[] = [];

  const mergeTasks = () => {
    // Merge and deduplicate (in case user assigns task to themselves)
    const allTasks = [...ownedTasks];
    assignedTasks.forEach((task) => {
      if (!allTasks.find((t) => t.id === task.id)) {
        allTasks.push(task);
      }
    });
    // Sort by createdAt descending
    allTasks.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    callback(allTasks);
  };

  const unsubOwned = subscribeToOwnedTasks(userId, (tasks) => {
    ownedTasks = tasks;
    mergeTasks();
  });

  const unsubAssigned = subscribeToAssignedTasks(userId, (tasks) => {
    assignedTasks = tasks;
    mergeTasks();
  });

  return () => {
    unsubOwned();
    unsubAssigned();
  };
}

// Legacy function name for backwards compatibility
export function subscribeToTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
): Unsubscribe {
  return subscribeToUserTasks(userId, callback);
}

// Subscribe to ALL tasks (for admins)
export function subscribeToAllTasks(
  callback: (tasks: Task[]) => void,
): Unsubscribe {
  const q = query(tasksRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(docToTask);
    callback(tasks);
  });
}

export async function createTask(
  userId: string,
  data: CreateTaskData,
): Promise<string> {
  const docRef = await addDoc(tasksRef, {
    ...data,
    ownerId: userId,
    imageUrls: [],
    assignee: data.assignee || null,
    assignedBy: data.assignedBy || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTask(
  _userId: string,
  taskId: string,
  data: UpdateTaskData,
): Promise<void> {
  const taskRef = getTaskDocRef(taskId);
  await updateDoc(taskRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(
  _userId: string,
  taskId: string,
): Promise<void> {
  const taskRef = getTaskDocRef(taskId);
  await deleteDoc(taskRef);
}

export async function updateTaskStatus(
  _userId: string,
  taskId: string,
  status: TaskStatus,
): Promise<void> {
  const taskRef = getTaskDocRef(taskId);
  await updateDoc(taskRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
