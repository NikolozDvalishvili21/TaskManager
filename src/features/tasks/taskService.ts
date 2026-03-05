import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Task, TaskStatus, TaskPriority, Assignee } from "../../types";

const getUserTasksRef = (userId: string) =>
  collection(db, "users", userId, "tasks");

const getTaskDocRef = (userId: string, taskId: string) =>
  doc(db, "users", userId, "tasks", taskId);

export interface CreateTaskData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  assignee: Assignee | null;
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
}

function convertTimestamp(timestamp: Timestamp | null): string {
  if (!timestamp) return new Date().toISOString();
  return timestamp.toDate().toISOString();
}

export async function getTasks(userId: string): Promise<Task[]> {
  const tasksRef = getUserTasksRef(userId);
  const q = query(tasksRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate || null,
      tags: data.tags || [],
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      imageUrls: data.imageUrls || [],
      userId,
      assignee: data.assignee || null,
    };
  });
}

export function subscribeToTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
): Unsubscribe {
  const tasksRef = getUserTasksRef(userId);
  const q = query(tasksRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || null,
        tags: data.tags || [],
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        imageUrls: data.imageUrls || [],
        userId,
        assignee: data.assignee || null,
      };
    });
    callback(tasks);
  });
}

export async function createTask(
  userId: string,
  data: CreateTaskData,
): Promise<string> {
  const tasksRef = getUserTasksRef(userId);
  const docRef = await addDoc(tasksRef, {
    ...data,
    imageUrls: [],
    assignee: data.assignee || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: UpdateTaskData,
): Promise<void> {
  const taskRef = getTaskDocRef(userId, taskId);
  await updateDoc(taskRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(
  userId: string,
  taskId: string,
): Promise<void> {
  const taskRef = getTaskDocRef(userId, taskId);
  await deleteDoc(taskRef);
}

export async function updateTaskStatus(
  userId: string,
  taskId: string,
  status: TaskStatus,
): Promise<void> {
  const taskRef = getTaskDocRef(userId, taskId);
  await updateDoc(taskRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
